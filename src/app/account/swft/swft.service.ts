import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { Storage } from '@ionic/storage'

export interface CreateOrderParameters {
  depositSymbol: string
  depositAmount: number
  refundAddress: string
  receiveSymbol: string
  receiveAmount: number
  receiveAddress: string
}

export interface Pairs { [index: string]: string[] }

export interface Rate {
  depositMax: number
  depositMin: number
  instantRate: number
  receiveCoinFee: number // Fixed fee to be payed in receive coin (not rate)
  minerFee?: number // Only if SWFT token is used to pay fee
  depositCoinFeeRate?: number // Fee rate if SWFT token is not used to pay fee
}

export interface OrderDetails {
  id: string
  status: string
  deposit: {
    symbol: string
    amount: number
    fee: number
    feeRate: number
    status: string
  }
  receive: {
    symbol: string
    amount: number
    address: string
    txid: string
  }
  refund: {
    address: string
    amount?: number
    fee?: number
    txid?: string
  }
}

@Injectable({
  providedIn: 'root'
})
export class SwftService {
  private URL = 'https://bridge.mvs.org/api'

  constructor(
    private http: HttpClient,
    private storage: Storage,
  ) { }

  getBridgeRate(depositSymbol, receiveSymbol): Observable<Rate> {
    return this.http.get<Rate>(`${this.URL}/rate/${depositSymbol}/${receiveSymbol}`)
  }

  getBridgePairs(): Observable<Pairs> {
    return this.http.get<Pairs>(`${this.URL}/pairs`)
  }

  getOrder(id: string): Observable<OrderDetails> {
    return this.http.get<OrderDetails>(`${this.URL}/order/${id}`)
  }

  createOrder(order: CreateOrderParameters): Observable<OrderDetails> {
    return this.http.post<OrderDetails>(`${this.URL}/order`, order)
  }

  async getOrders(): Promise<OrderDetails[]> {
    return await this.storage.get('etp_bridge_orders') || []
  }

  setOrders(orders: OrderDetails[]): Promise<OrderDetails[]> {
    return this.storage.set('etp_bridge_orders', orders)
  }

  saveOrder(order: OrderDetails) {
    return this.getOrders()
      .then(orders => {
        let update = false
        orders = orders.map(o => {
          if (o.id === order.id) {
            update = true
            return order
          }
          return o
        })
        if (!update) {
          orders.push(order)
        }
        return this.setOrders(orders)
      })
  }

  isMetaverseSymbol(symbol: string = '') {
    const validSymbols = ['ETP'] // at least 1 of these symbol is required
    return validSymbols.indexOf(symbol) !== -1
  }
}
