import { Injectable } from '@angular/core'
import { AppService } from './app.service'
import { BehaviorSubject } from 'rxjs'
import { filter } from 'rxjs/operators'
import Web3 from 'web3'
import BN from 'bn.js'
import { WalletService } from './wallet.service'


export interface VMTransactionConfig {
  to: string
  //value: string
  value: BN
  chainId?: number
  data?: string
  nonce?: number
  gas: number
  gasPrice: number
}

@Injectable({
  providedIn: 'root'
})
export class VmService {

  network: string

  ready$ = new BehaviorSubject<boolean>(false)

  web3: Web3
  Tx = require('ethereumjs-tx').Transaction

  constructor(
    public appService: AppService,
    private wallet: WalletService,
  ) {
      this.web3 = new Web3()

    this.appService.network$
    .pipe(filter(n => !!n))
    .subscribe(network => {
      console.log('setup metaverse service for network', network)
      this.network = network === 'testnet' ? 'https://vm.mvs.org/testnet_rpc/' : 'https://vm.mvs.org/mainnet_rpc/'
      //this.network = 'http://localhost:9933'
      //this.network = 'http://167.86.95.203:15539'
      this.web3.setProvider(this.network)
      this.ready$.next(true)
    })
  }

  async sendParams(to: string, value: string, gas: number = this.appService.default_fees_vm.gas, gasPrice: number = this.appService.default_fees_vm.gasPrice) {
    //const quantity = parseFloat(value) * Math.pow(10, 18) + ''
    const params = {
      to,
      value: this.web3.utils.toWei(value + '', 'ether'),
      //value: new BN(parseFloat(value) * Math.pow(10, 18)),
      //value: quantity,
      chainId: this.network  === 'testnet' ? 43 : 23,
      networkId: this.network  === 'testnet' ? 43 : 23,
      gas,
      gasPrice,
      nonce: undefined,
    }
    return params
  }

  getHeight() {
    return this.web3.eth.getBlockNumber()
  }

  getTransaction(hash: string) {
    return this.web3.eth.getTransaction(hash)
  }

  showBlockNumber(block: { number: Buffer }) {
    const number = new BN(block.number.toString('hex'), 16).toNumber()
    return number
  }

  async getPrivateKey(passphrase: string) {
    const privateKey = await this.wallet.exportPrivateKey(passphrase, "m/44'/60'/0'/0/0")
    console.log(privateKey)
    return privateKey
  }

  async sign(params: any, passphrase: string) {
    const privateKey = await this.wallet.exportPrivateKey(passphrase, "m/44'/60'/0'/0/0")
    const account = this.web3.eth.accounts.wallet.add(privateKey)
    const signedTx = await account.signTransaction(params)
    this.web3.eth.accounts.wallet.clear()
    return signedTx
  }

  async send(signedTx) {
    const tx = this.web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .once('transactionHash', (hash) => {
      console.log({hash})
    })
    return tx
  }

  async balanceOf(address: string) {
    return this.web3.eth.getBalance(address)
  }

}
