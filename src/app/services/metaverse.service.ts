import { Injectable } from '@angular/core'
import Metaverse from 'metaversejs/dist/metaverse.js'
import { ConfigService } from './config.service'
import { Observable, BehaviorSubject, Subject, interval } from 'rxjs'
import { flatMap, first } from 'rxjs/operators'
import { combineLatest } from 'rxjs/observable/combineLatest'
import { WalletService, Balances } from './wallet.service'
import { MultisigService } from './multisig.service'
import { Storage } from '@ionic/storage'
import Blockchain from 'mvs-blockchain/dist/index'

export interface Transaction {
  height: number
  hash: string
}

export type Network = 'mainnet' | 'testnet'

@Injectable({
  providedIn: 'root',
})
export class MetaverseService {

  syncing$ = new BehaviorSubject<boolean>(false)
  transactions$ = new BehaviorSubject<Transaction[]>([])
  height$ = new BehaviorSubject<number>(undefined)

  heartbeat$ = interval(5000)
  readonly network = this.config.defaultNetwork

  blockchain: any

  constructor(
    private config: ConfigService,
    private storage: Storage,
    private wallet: WalletService,
    private multisig: MultisigService,
  ) {
    this.setNetwork(this.config.defaultNetwork)
    this.restoreTransactions().then(txs => this.transactions$.next(txs))
    this.sync()
    this.heartbeat$.subscribe(() => this.sync())
  }

  reset() {
    this.height$.next(undefined)
    this.storage.remove('transactions')
    this.transactions$.next([])
  }

  loaderCondition() {
    return this.wallet.addresses$.value &&
      this.wallet.addresses$.value.length
  }

  async sync() {
    if (await this.syncing$.value === true || !this.loaderCondition()) {
      return
    }
    this.syncing$.next(true)
    try {
      await this.updateHeight()
      await this.getData()
    } catch (error) {
      console.error(error)
      this.syncing$.next(false)
    }
    this.syncing$.next(false)
  }

  setNetwork(network: Network) {
    this.blockchain = Blockchain({ network: this.network })
  }

  utxos$ = (addresses$: Observable<string[]>) => combineLatest([
    this.transactions$,
    addresses$,
  ]).pipe(
    flatMap(([transactions, addresses]) => Metaverse.output.calculateUtxo(transactions, addresses)),
  )

  private async getData(): Promise<any> {
    console.log('getting data')
    const addresses = await this.wallet.getAddresses()
    addresses.concat(await this.multisig.getMultisigAddresses())
    let newTxs = await this.getNewTxs(addresses, await this.getLastTxHeight())
    const newTransactionsFound = newTxs && newTxs.length
    while (newTxs && newTxs.length) {
      newTxs = await this.getNewTxs(addresses, await this.getLastTxHeight())
      this.transactions$.next(await this.restoreTransactions())
    }
    if (newTransactionsFound) {
      this.transactions$.next(await this.restoreTransactions())
    }
  }

  async updateHeight() {
    const height = await this.blockchain.height()
    this.height$.next(height)
  }

  async getLastTxHeight() {
    const transactions = await (this.transactions$.pipe(first())).toPromise()
    if (!transactions || transactions.length === 0) {
      return 0
    }
    return transactions[0].height
  }

  async getNewTxs(addresses: Array<string>, lastKnownHeight: number): Promise<any> {
    const newTxs = await this.loadNewTxs(addresses, lastKnownHeight + 1)
    return this.storeTransactions(newTxs)
  }

  loadNewTxs(addresses: Array<string>, start: number) {
    return this.blockchain.addresses.listTxs(addresses, { min_height: start })
      .catch((error: Error) => {
        console.log('error loading transactions')
        throw Error('ERR_SYNC_NEW_TRANSACTIONS')
      })
  }

  async storeTransactions(newtxs: Array<any>) {
    if (newtxs === undefined || newtxs.length === 0) {
      return newtxs
    }
    let txs = await this.restoreTransactions()
    newtxs = newtxs.sort((a: any, b: any) => a.height - b.height)
    newtxs.forEach((newtx) => {
      const found = this.findTxIndexByHash(txs, newtx.hash)
      if (found === -1) {
        txs = [newtx].concat(txs)
      } else {
        txs[found] = newtx
      }
    })
    await this.storage.set('transactions', txs)
    return newtxs
  }

  private findTxIndexByHash = (txs: Transaction[], hash: string) => txs.findIndex(tx => tx.hash === hash)

  async restoreTransactions() {
    return await this.storage.get('transactions') || []
  }

  public sortByTransactionHeight(a: Transaction, b: Transaction) {
    return b.height - a.height
  }

  getTickers = () => this.blockchain.pricing.tickers()

  async getBlocktime(currentHeight: number) {
    const blocktime = await this.storage.get('blocktime')
    if (blocktime === undefined || blocktime.height === undefined || currentHeight > blocktime.height + 1000) {
      try {
        const downscale = 10
        const time = await this.blockchain.block.blocktime(downscale)
        await this.setBlocktime(time, currentHeight)
        return time
      } catch (error) {
        console.error(error)
        throw Error('ERR_GET_BLOCKTIME')
      }
    } else {
      return blocktime.time
    }
  }

  /**
   * Stores the blocktime information
   *
   * @param time Blocktime in seconds
   * @param height In blocks
   */
  setBlocktime(time: number, height: number) {
    return this.storage.set('blocktime', { time, height })
  }

  createSendTx(passphrase: string, asset: string, recipientAddress: string, recipientAvatar: string, quantity: number,
               fromAddress: string, changeAddress: string, fee: number, messages: Array<string>, network: string) {
    const target = {}
    target[asset] = quantity
    return this.wallet.getHDNode(passphrase, network)
      .then(wallet => this.getUtxoFrom(fromAddress)
        .then((utxo) => this.getHeight().then(height => Metaverse.output.findUtxo(utxo, target, height, fee)))
        .then((result) => {
          if (result.utxo.length > 676) {
            throw Error('ERR_TOO_MANY_INPUTS')
          }
          // Set change address to first utxo's address
          if (changeAddress === undefined) {
            changeAddress = result.utxo[0].address
          }
          return Metaverse.transaction_builder.send(result.utxo, recipientAddress, recipientAvatar, target, changeAddress,
            result.change, result.lockedAssetChange, fee, messages)
        })
        .then((tx) => wallet.sign(tx)))
      .catch((error) => {
        console.error(error)
        throw Error(error.message)
      })
  }

  getTxs() {
    return this.storage.get('transactions')
      .then((txs) => (txs) ? txs : [])
  }

  getUtxo() {
    return this.getTxs()
      .then((txs: Array<any>) => txs.sort(function(a, b) {
        return b.height - a.height
      }))
      .then((txs: Array<any>) => this.wallet.getAddresses()
        .then((addresses: Array<string>) => Metaverse.output.calculateUtxo(txs, addresses)))
  }

  getUtxoFrom(address: any) {
    return this.getUtxo()
      .then((utxo: Array<any>) => {
        if (address) {
          const result = []
          if (utxo.length) {
            utxo.forEach((output) => {
              if (output.address === address) { result.push(output) }
            })
          }
          return result
        } else {
          return utxo
        }
      })
  }

  getHeight() {
    return this.storage.get('mvs_height').then((height) => (height) ? height : 0)
  }

  send = async (tx, balances) => {
    tx.hash = (await this.broadcast(tx.encode().toString('hex'))).hash
    tx.height = await this.getHeight()
    tx.unconfirmed = true
    tx.outputs.forEach((output, index) => {
      output.index = index
      output.locked_height_range = (output.locktime) ? output.locktime : 0
      output.locked_until = (output.locktime) ? tx.height + output.locked_height_range : 0
      switch (output.attachment.type) {
        case Metaverse.constants.ATTACHMENT.TYPE.MST:
          switch (output.attachment.status) {
            case Metaverse.constants.MST.STATUS.REGISTER:
              output.attachment.type = 'asset-issue'
              break
            case Metaverse.constants.MST.STATUS.TRANSFER:
              output.attachment.type = 'asset-transfer'
              if (balances && balances.MST && balances.MST[output.attachment.symbol]) {
                output.attachment.decimals = balances.MST[output.attachment.symbol].decimals
              }
              break
          }
          break
        case Metaverse.constants.ATTACHMENT.TYPE.MIT:
          output.attachment.type = 'mit'
          break
        case Metaverse.constants.ATTACHMENT.TYPE.ETP_TRANSFER:
          output.attachment.type = 'etp'
          output.attachment.symbol = 'ETP'
          output.attachment.decimals = 8
          break
      }
    })
    return this.addTxs([tx])
      .then(() => this.getData())
      .then(() => tx)
  }

  broadcast(rawtx: string) {
    return this.blockchain.transaction.broadcast(rawtx)
  }

  async addTxs(newtxs: Array<any>) {
    if (newtxs === undefined || newtxs.length === 0) {
      return newtxs
    }
    let txs = await this.getTxs()
    newtxs = newtxs.sort((a: any, b: any) => a.height - b.height)
    newtxs.forEach((newtx) => {
      const found = this.findTxIndexByHash(txs, newtx.hash)
      if (found === -1) {
        txs = [newtx].concat(txs)
      } else {
        txs[found] = newtx
      }
    })
    await this.storage.set('mvs_txs', txs)
    await this.storage.set('mvs_last_tx_height', txs[0].height)
    return newtxs
  }

}
