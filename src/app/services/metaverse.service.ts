import { Injectable } from '@angular/core'
import Metaverse from 'metaversejs/dist/metaverse.js'
import { ConfigService } from './config.service'
import { Observable, BehaviorSubject, Subject, interval, of } from 'rxjs'
import { flatMap, first, last, take } from 'rxjs/operators'
import { combineLatest } from 'rxjs/observable/combineLatest'
import { WalletService, Balances } from './wallet.service'
import { MultisigService } from './multisig.service'
import { Storage } from '@ionic/storage'
import Blockchain from 'mvs-blockchain/dist/index'
import { DatastoreService } from './datastore.service';

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
  height$ = new BehaviorSubject<number>(undefined)

  heartbeat$ = interval(5000)
  readonly network = this.config.defaultNetwork

  blockchain: any

  constructor(
    private config: ConfigService,
    private storage: Storage,
    private datastore: DatastoreService,
    private wallet: WalletService,
    private multisig: MultisigService,
  ) {
    this.setNetwork(this.config.defaultNetwork)
    this.sync()
    this.heartbeat$.subscribe(() => this.sync())
  }


  transactionStream = (): Promise<Observable<Transaction[]>> => this.datastore.watchTransactions()

  reset() {
    this.height$.next(undefined)
    this.storage.remove('transactions')
    this.datastore.clearTransactions()
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
      const newTxCount = await this.getData()
      console.log(newTxCount)
    } catch (error) {
      console.error(error)
      this.syncing$.next(false)
    }
    this.syncing$.next(false)
  }

  setNetwork(network: Network) {
    this.blockchain = Blockchain({ network: this.network })
  }

  utxoStream = async (addresses$: Observable<string[]>) => {
    return combineLatest([
      await this.transactionStream(),
      addresses$,
    ]).pipe(flatMap(([transactions, addresses]) => Metaverse.output.calculateUtxo(transactions, addresses)))
  }

  private async getData(): Promise<any> {
    console.log('getting data')
    const addresses = await this.wallet.getAddresses()
    addresses.concat(await this.multisig.getMultisigAddresses())
    let newTxs = await this.getNewTxs(addresses, await this.getLastTxHeight())
    let counter = newTxs.length
    while (newTxs && newTxs.length) {
      newTxs = await this.getNewTxs(addresses, await this.getLastTxHeight())
      counter += newTxs.length
    }
    return counter
  }

  async updateHeight() {
    const height = await this.blockchain.height()
    this.height$.next(height)
  }

  async getLastTxHeight() {
    if (await this.transactionStream() == undefined) { return undefined }
    const transactions = await ((await this.transactionStream()).pipe(first())).toPromise()
    if (!transactions || transactions.length === 0) {
      return 0
    }
    return transactions[0].height
  }

  async getNewTxs(addresses: Array<string>, lastKnownHeight: number): Promise<any> {
    const transactions = await this.loadNewTxs(addresses, lastKnownHeight + 1)
    await this.datastore.saveTransactions(transactions)
    return transactions
  }

  loadNewTxs(addresses: Array<string>, start: number) {
    return this.blockchain.addresses.listTxs(addresses, { min_height: start })
      .catch((error: Error) => {
        console.log('error loading transactions')
        throw Error('ERR_SYNC_NEW_TRANSACTIONS')
      })
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

  async createSendTx(
    passphrase: string,
    asset: string,
    recipientAddress: string,
    recipientAvatar: string,
    quantity: number,
    fromAddress: string,
    changeAddress: string,
    fee: number,
    messages: Array<string>,
    network: string,
    ) {

    const target = {}
    target[asset] = quantity
    try {
      const wallet = await this.wallet.getHDNode(passphrase, network)
      const utxos = await this.getUtxoFrom(fromAddress)
      const height = await this.height$.pipe(take(1)).toPromise()
      console.log(height)
      const seletedUtxos = await Metaverse.output.findUtxo(utxos, target, height, fee)

      if (seletedUtxos.utxo.length > 676) {
        throw Error('ERR_TOO_MANY_INPUTS')
      }
      if (changeAddress === undefined) {
        changeAddress = seletedUtxos.utxo[0].address
      }
      const transaction = await Metaverse.transaction_builder.send(
        seletedUtxos.utxo,
        recipientAddress,
        recipientAvatar,
        target,
        changeAddress,
        seletedUtxos.change,
        seletedUtxos.lockedAssetChange,
        fee, messages,
      )

      return wallet.sign(transaction)

    } catch (error) {
      console.error(error)
      throw Error(error.message)
    }
  }

  getUtxoFrom(address?: string) {
    if (address) {
      return this.utxoStream(of([address]))
        .then(stream => stream.pipe(take(1)).toPromise())
    }
    return this.utxoStream(this.wallet.addresses$)
      .then(stream => stream.pipe(take(1)).toPromise())
  }

  send = async (tx, balances) => {
    tx.hash = (await this.broadcast(tx.encode().toString('hex'))).hash
    tx.height = await this.height$.toPromise()
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
    return this.datastore.saveTransaction(tx)
      .then(() => this.getData())
      .then(() => tx)
  }

  broadcast(rawtx: string) {
    return this.blockchain.transaction.broadcast(rawtx)
  }


}
