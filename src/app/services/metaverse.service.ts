import { Injectable } from '@angular/core'
import { AppService } from './app.service'
import { Storage } from '@ionic/storage'
import { WalletService } from './wallet.service'
import Metaverse from 'metaversejs/index.js'
import Blockchain from 'mvs-blockchain'
import { keyBy } from 'lodash'
import { Subject, BehaviorSubject } from 'rxjs'
import { filter } from 'rxjs/operators'

class Ticker {
  market_cap: number
  percent_change_1h: number
  percent_change_7d: number
  percent_change_24h: number
  price: number
  volume_24h: number
}

class BaseTickers {
  BTC: Ticker
  USD: Ticker
  CNY: Ticker
  EUR: Ticker
  JPY: Ticker
}

@Injectable({
  providedIn: 'root'
})
export class MetaverseService {

  private blockchain

  ready$ = new BehaviorSubject<boolean>(false)
  syncing$ = new BehaviorSubject<boolean>(false)
  height$ = new BehaviorSubject<number>(null)

  lastTxHeight$ = new BehaviorSubject<number>(0)

  DEFAULT_BALANCES = {
    ETP: { frozen: 0, available: 0, decimals: 8 },
    MST: {
      'DNA': { frozen: 0, available: 0, decimals: 4 },
      'APO': { frozen: 0, available: 0, decimals: 4 },
      'SDG': { frozen: 0, available: 0, decimals: 8 },
    },
    MIT: []
  }

  constructor(
    public appService: AppService,
    private wallet: WalletService,
    private storage: Storage
  ) {
    this.appService.network$
      .pipe(filter(n => !!n))
      .subscribe(network => {
        console.info('setup metaverse service for network', network)
        this.blockchain = Blockchain({ url: network === 'testnet' ? 'https://testnet-api.myetpwallet.com/api/' : 'https://mainnet-api.myetpwallet.com/api/' })
        this.ready$.next(true)
      })
  }

  createSendTx(asset: string, recipient_address: string, recipient_avatar: string, quantity: number, from_address: string, change_address: string, fee: number, messages: Array<string>) {
    const target = {}
    target[asset] = quantity
    return this.getUtxoFrom(from_address)
      .then((utxo) => this.getHeight().then(height => Metaverse.output.findUtxo(utxo, target, height, fee)))
      .then((result) => {
        if (result.utxo.length > 676) {
          throw Error('ERR_TOO_MANY_INPUTS')
        }
        // Set etp change address to the first utxo's address with etp
        let etp_change_address = change_address
        if (etp_change_address == undefined) {
          result.utxo.forEach(utxo => {
            if (utxo.value !== 0) {
              etp_change_address = utxo.address
              return
            }
          })
        }
        // Set mst change address to first utxo's address with this mst
        let mst_change_address = change_address
        if (mst_change_address == undefined && asset != 'ETP') {
          result.utxo.forEach(utxo => {
            if (utxo.attachment.symbol == asset) {
              mst_change_address = utxo.address
              return
            }
          })
        }
        return Metaverse.transaction_builder.send(result.utxo, recipient_address, recipient_avatar, target, etp_change_address, result.change, result.lockedAssetChange, fee, messages, mst_change_address)
      })
      .catch((error) => {
        console.error(error)
        throw Error(error.message)
      })
  }

  burn(asset: string, quantity: number, from_address: string, change_address: string, fee: number, messages: Array<string>) {
    const target = {}
    target[asset] = quantity
    return this.getUtxoFrom(from_address)
      .then((utxo) => this.getHeight().then(height => Metaverse.output.findUtxo(utxo, target, height, fee)))
      .then((result) => {
        if (result.utxo.length > 676) {
          throw Error('ERR_TOO_MANY_INPUTS')
        }
        // Set etp change address to the first utxo's address with etp
        let etp_change_address = change_address
        if (etp_change_address == undefined) {
          result.utxo.forEach(utxo => {
            if (utxo.value !== 0) {
              etp_change_address = utxo.address
              return
            }
          })
        }
        // Set mst change address to first utxo's address with this mst
        let mst_change_address = change_address
        if (mst_change_address == undefined && asset != 'ETP') {
          result.utxo.forEach(utxo => {
            if (utxo.attachment.symbol == asset) {
              mst_change_address = utxo.address
              return
            }
          })
        }
        return Metaverse.transaction_builder.burn(result.utxo, target, undefined, etp_change_address, result.change, result.lockedAssetChange, messages, mst_change_address, fee)
      })
      .catch((error) => {
        console.error(error)
        throw Error(error.message)
      })
  }

  createSendMultisigTx(passphrase: string, asset: string, recipient_address: string, recipient_avatar: string, quantity: number, from_address: string, change_address: string, fee: number, messages: Array<string>, multisig: any) {
    const target = {}
    target[asset] = quantity
    return this.wallet.getWallet(passphrase)
      .then(wallet => this.getUtxoFromMultisig(from_address)
        .then((utxo) => this.getHeight().then(height => Metaverse.output.findUtxo(utxo, target, height, fee)))
        .then((result) => {
          if (result.utxo.length > 676) {
            throw Error('ERR_TOO_MANY_INPUTS')
          }
          // Set change address to first utxo's address
          if (change_address == undefined) {
            change_address = result.utxo[0].address;
          }
          return Metaverse.transaction_builder.send(result.utxo, recipient_address, recipient_avatar, target, change_address, result.change, undefined, fee, messages)
        })
        .then((tx) => wallet.signMultisig(tx, multisig)))
      .catch((error) => {
        console.error(error)
        throw Error(error.message)
      })
  }

  createSendMoreTx(target: any, recipients: Array<any>, from_address: string, change_address: string, messages: Array<string>) {
    return this.getUtxoFrom(from_address)
      .then((utxo) => this.getHeight().then(height => Metaverse.output.findUtxo(utxo, target, height, Metaverse.constants.FEE.DEFAULT * recipients.length)))
      .then((result) => {
        // Set change address to first utxo's address
        if (change_address == undefined) {
          change_address = result.utxo[0].address;
        }
        return Metaverse.transaction_builder.sendMore(result.utxo, recipients, change_address, result.change, undefined, Metaverse.constants.FEE.DEFAULT * recipients.length, messages)
      })
      .catch((error) => {
        console.error(error)
        throw Error(error.message)
      })
  }

  createSendSwapTx(asset: string, recipient_address: string, recipient_avatar: string, quantity: number, from_address: string, change_address: string, fee: number, messages: Array<string>, swap_fee: number) {
    const target = {}
    target[asset] = quantity
    return this.getUtxoFrom(from_address)
      .then((utxo) => this.getHeight().then(height => Metaverse.output.findUtxo(utxo, target, height, fee + swap_fee)))
      .then((result) => {
        if (result.utxo.length > 676) {
          throw Error('ERR_TOO_MANY_INPUTS')
        }
        // Set change address to first utxo's address
        if (change_address == undefined) {
          change_address = result.utxo[0].address;
        }
        return Metaverse.transaction_builder.sendSwap(result.utxo, recipient_address, recipient_avatar, target, change_address, result.change, undefined, fee, this.appService.network, messages, swap_fee)
      })
      .catch((error) => {
        console.error(error)
        throw Error(error.message)
      })
  }

  createAssetDepositTx(recipient_address: string, recipient_avatar: string, symbol: string, quantity: number, attenuation_model: string, from_address: string, change_address: string, fee: number, messages: Array<string>) {
    const target = { [symbol]: quantity }
    return this.getUtxoFrom(from_address)
      .then((utxo) => this.getHeight().then(height => Metaverse.output.findUtxo(utxo, target, height, fee)))
      .then((result) => {
        if (result.utxo.length > 676) {
          throw Error('ERR_TOO_MANY_INPUTS')
        }
        // Set change address to first utxo's address
        if (change_address == undefined) {
          change_address = result.utxo[0].address;
        }
        if (recipient_address == undefined) {
          recipient_address = result.utxo[0].address;
        }
        return Metaverse.transaction_builder.sendLockedAsset(result.utxo, recipient_address, recipient_avatar, symbol, quantity, attenuation_model, change_address, result.change, undefined, fee, messages)
      })
      .catch((error) => {
        console.error(error)
        throw Error(error.message)
      })
  }

  voteAgainTx(utxo_to_use: any, recipient_address: string, recipient_avatar: string, symbol: string, quantity: number, attenuation_model: string, change_address: string, fee: number, messages: Array<string>) {
    const target = { [symbol]: quantity }
    return Promise.all([this.getUtxoFrom(undefined), this.getHeight()])
      .then(([utxo, height]) => {
        for (let i = 0; i < utxo.length; i++) {
          let current_utxo = utxo[i]
          if (current_utxo.value >= 10000) {
            utxo_to_use.push(current_utxo)
            break
          }
        }
        return Metaverse.output.findUtxo(utxo_to_use, target, height, fee)
      })
      .then((result) => {
        // Verify that the UTXO of the previous is well included
        if (result.utxo.length > 676) {
          throw Error('ERR_TOO_MANY_INPUTS')
        }
        // Set change address to first utxo's address
        if (change_address == undefined) {
          change_address = result.utxo[0].address;
        }
        if (recipient_address == undefined) {
          recipient_address = result.utxo[0].address;
        }
        return Metaverse.transaction_builder.sendLockedAsset(
          result.utxo,
          recipient_address,
          recipient_avatar,
          symbol,
          quantity,
          attenuation_model,
          change_address,
          result.change,
          undefined,
          fee,
          messages
        )
      })
      .catch((error) => {
        console.error(error)
        throw Error(error.message)
      })
  }

  createAvatarTx(avatar_address: string, symbol: string, change_address: string, bounty_fee: number, messages: Array<string>) {
    return this.getUtxoFrom(avatar_address)
      .then((utxo) => this.getHeight().then(height => Metaverse.output.findUtxo(utxo, {}, height, Metaverse.constants.FEE.AVATAR_REGISTER)))
      .then((result) => {
        // Set change address to first utxo's address
        if (change_address == undefined) {
          change_address = result.utxo[0].address;
        }
        return Metaverse.transaction_builder.issueDid(result.utxo, avatar_address, symbol, change_address, result.change, bounty_fee, this.appService.network, messages)
      })
      .catch((error) => {
        console.error(error)
        throw Error(error.message)
      })
  }

  createRegisterMITTx(recipient_address: string, recipient_avatar, symbol: string, content: string, change_address: string, fee: number) {
    return this.getUtxoFrom(recipient_address)
      .then((utxo) => this.getHeight().then(height => Metaverse.output.findUtxo(utxo, {}, height, fee)))
      .then((result) => {
        // Set change address to first utxo's address
        if (change_address == undefined) {
          change_address = result.utxo[0].address;
        }
        return Metaverse.transaction_builder.registerMIT(result.utxo, recipient_address, recipient_avatar, symbol, content, change_address, result.change, fee)
      })
      .catch((error) => {
        console.error(error)
        throw Error(error.message)
      })
  }

  createTransferMITTx(sender_avatar: string, recipient_address: string, recipient_avatar, symbol: string, fee_address: string, change_address: string, fee: number) {
    return this.getUtxoFrom(fee_address)
      .then((utxo) => Promise.all([this.getHeight().then(height => Metaverse.output.findUtxo(utxo, {}, height, fee)), this.getUtxo().then(utxo => Metaverse.output.filter(utxo, { type: 'mit', symbol }))]))
      .then((result) => {
        let fee_utxo = result[0]
        let mit_utxo = result[1]
        if (mit_utxo.length !== 1) {
          throw Error('ERR_FIND_MIT')
        }
        // Set change address to first utxo's address
        if (change_address == undefined) {
          change_address = fee_utxo.utxo[0].address;
        }
        return Metaverse.transaction_builder.transferMIT(fee_utxo.utxo.concat(mit_utxo), sender_avatar, recipient_address, recipient_avatar, symbol, change_address, fee_utxo.change, fee)
      })
      .catch((error) => {
        console.error(error)
        throw Error(error.message)
      })
  }

  createIssueAssetTx(symbol: string, quantity: number, precision: number, issuer: string, description: string, secondaryissue_threshold: number, is_secondaryissue: boolean, issue_address: string, change_address: string, create_new_domain_cert: boolean, use_naming_cert: boolean, bounty_fee: number, attenuation_model: string, mst_mining_model: any) {
    return this.getUtxoFrom(issue_address)
      .then(utxo => this.getHeight().then(height => Metaverse.output.findUtxo(utxo, {}, height, Metaverse.constants.FEE.MST_REGISTER))
        .then((result) => {
          // Set change address to first utxo's address
          if (change_address == undefined) {
            change_address = result.utxo[0].address;
          }
          const certs = utxo.filter(output => {
            if (use_naming_cert) {
              if (output.attachment.type == 'asset-cert' && output.attachment.symbol == symbol && ['naming'].indexOf(output.attachment.cert) !== -1) {
                return true
              }
              return false
            } else {
              if (!use_naming_cert && output.attachment.type == 'asset-cert' && output.attachment.symbol == symbol.split('.')[0] && output.attachment.cert == 'domain') {
                return true;
              }
              else if (output.attachment.type == 'asset-cert' && output.attachment.symbol == symbol && ['naming', 'issue'].indexOf(output.attachment.cert) !== -1) {
                return true;
              }
              return false
            }
          })
          return Metaverse.transaction_builder.issueAsset(result.utxo.concat(certs), issue_address, symbol, quantity, precision, issuer, description, secondaryissue_threshold, is_secondaryissue, change_address, result.change, create_new_domain_cert, bounty_fee, this.appService.network, attenuation_model, mst_mining_model)
        })
      )
      .catch((error) => {
        console.error(error)
        throw Error(error.message)
      })
  }

  validAddress = (address: string) => {
    return Metaverse.address.validate(address, this.appService.network)
  }

  async updateHeight() {
    const height = await this.blockchain.height()
    await this.setHeight(height)
    return this.getHeight()
  }

  getUtxo() {
    return this.getTxs()
      .then((txs: Array<any>) => txs.sort(function(a, b) {
        return b.height - a.height
      }))
      .then((txs: Array<any>) => Promise.all([this.getAddresses(), this.removeOutputsForUnconfirmedTxs(txs)])
        .then(([addresses, txs]) => Metaverse.output.calculateUtxo(txs, addresses)))
  }

  async removeOutputsForUnconfirmedTxs(txs) {
    const height = await this.getHeight()
    return txs.map((tx) => {
      if (tx.height && height > tx.height + this.appService.min_confirmations) {
        return tx
      } else {
        tx.outputs = []
        return tx
      }
    })
  }

  async getUtxoFrom(address: any) {
    const utxo = await this.getUtxo()
    return address ? utxo.filter(output => output.address == address) : utxo
  }

  getUtxoFromMultisig(address: any) {
    return this.getTxs()
      .then((txs: Array<any>) => txs.sort(function(a, b) {
        return b.height - a.height
      }))
      .then((txs: Array<any>) => Metaverse.output.calculateUtxo(txs, [address]))
  }

  listAvatars() {
    return this.getUtxo()
      .then((outputs) => this.blockchain.avatar.extract(outputs))
  }

  listCerts() {
    return this.getUtxo()
      .then((outputs) => Metaverse.output.filter(outputs, { type: 'asset-cert' }))
  }

  getGlobalAvatar = (symbol) => this.blockchain.avatar.get(symbol)

  getAvatarAvailable = (symbol) => this.blockchain.avatar.available(symbol)

  getGlobalMit = (symbol) => this.blockchain.MIT.get(symbol)

  getListMst = () => this.blockchain.MST.list()

  getListMit = () => this.blockchain.MIT.list()

  getBalances() {
    return this.storage.get('balances')
      .then((balances: any) => {
        const b = JSON.parse(JSON.stringify(this.DEFAULT_BALANCES))
        if (balances) {
          if (balances.ETP) {
            b.ETP = balances.ETP;
          }
          if (balances.MST) {
            Object.keys(balances.MST).forEach((symbol) => {
              b.MST[symbol] = balances.MST[symbol];
            })
          }
          if (balances.MIT) {
            b.MIT = balances.MIT
          }
        }
        return b
      })
  }

  loadNewTxs(addresses: Array<string>, start: number) {
    return this.blockchain.addresses.listTxs(addresses, { min_height: start })
      .catch(error => {
        console.log('error loading transactions')
        throw (error.message)
      })
  }

  getAddressBalances() {
    return this.storage.get('addressbalances')
  }

  setAddressBalances(balances) {
    return this.storage.set('addressbalances', balances)
  }

  setBalances(newBalances) {
    return this.getBalances()
      .then((balances) => {
        // Check if balance has been changed
        const nb = JSON.parse(JSON.stringify(this.DEFAULT_BALANCES))
        Object.keys(newBalances).forEach((asset) => {
          nb[asset] = newBalances[asset]
        })
        if (JSON.stringify(balances) != JSON.stringify(nb)) {
          return this.storage.set('balances', newBalances)
        }
      })
  }

  async getData(): Promise<any> {
    this.syncing$.next(true)
    let addresses = await this.getAddresses()
    if (!addresses || addresses.length === 0) {
      throw Error('ERR_NO_ADDRESS')
    }
    const multisigAddresses = await this.wallet.getMultisigAddresses()
    addresses = addresses.concat(multisigAddresses)
    let newTxs = await this.getNewTxs(addresses, await this.getLastTxHeight())
    while (this.syncing$.value && newTxs && newTxs.length) {
      const lastTxHeight = await this.getLastTxHeight()
      this.lastTxHeight$.next(lastTxHeight)
      newTxs = await this.getNewTxs(addresses, lastTxHeight)
    }
    await this.calculateBalances()
    this.syncing$.next(false)
    return await this.getBalances()
  }

  async getUpdateNeeded(update_interval = this.appService.update_interval) {
    const lastUpdateTime = await this.getUpdateTime()
    return typeof lastUpdateTime === 'undefined' || (+(new Date()) - +lastUpdateTime) / 1000 > update_interval
  }

  calculateBalances() {
    return this.getHeight()
      .then(height => this.getAddresses()
        .then(addresses => this.wallet.getMultisigAddresses()
          .then(multisigAddresses => this.getTxs()
            .then(txs => Metaverse.output.calculateUtxo(txs, addresses.concat(multisigAddresses)))
            .then(utxos => Promise.all([
              this.blockchain.balance.all(utxos, addresses, height, undefined, this.appService.min_confirmations),
              this.blockchain.balance.addresses(utxos, addresses.concat(multisigAddresses), height, undefined, this.appService.min_confirmations)
            ]))
            .then((balances) => Promise.all([
              this.setBalances(balances[0]),
              this.setAddressBalances(balances[1])
            ]))
          )))
  }

  async getFrozenOutputs(asset) {
    const addresses = await this.getAddresses()
    const transactions = await this.getTxs()
    const outputs = []
    transactions.forEach(tx => {
      tx.outputs.forEach((output) => {
        if (asset == 'ETP' && output.locked_height_range > 0 && output.height && addresses.indexOf(output.address) !== -1) {
          output.locked_until = (output.locked_height_range) ? tx.height + output.locked_height_range : 0
          delete output.locked_height_range
          output.hash = tx.hash
          outputs.push(output)
        } else if (asset != 'ETP' && output.attachment && output.attachment.symbol == asset && output.attenuation_model_param && output.attenuation_model_param.lock_period > 0 && output.height && addresses.indexOf(output.address) !== -1) {
          delete output.locked_height_range
          output.hash = tx.hash
          switch (output.attenuation_model_param.type) {
            case 1:
              if (output.attenuation_model_param.current_period_nbr == 0 && output.attenuation_model_param.next_interval == output.attenuation_model_param.lock_period / output.attenuation_model_param.total_period_nbr) {
                output.locked_until = (output.attenuation_model_param && output.attenuation_model_param.lock_period) ? tx.height + output.attenuation_model_param.lock_period : 0
                outputs.push(output)
              }
              break
            case 2:
            case 3:
              if (output.attenuation_model_param.current_period_nbr == 0 && output.attenuation_model_param.next_interval == output.attenuation_model_param.locked[0].number) {
                output.locked_until = (output.attenuation_model_param && output.attenuation_model_param.lock_period) ? tx.height + output.attenuation_model_param.lock_period : 0
                outputs.push(output)
              }
              break
          }
        }
      })
    })
    return outputs
  }

  setUpdateTime(lastupdate = undefined) {
    if (lastupdate == undefined) {
      lastupdate = new Date()
    }
    return this.storage.set('last_update', lastupdate)
  }

  getUpdateTime() {
    return this.storage.get('last_update')
  }

  setHeight(height) {
    this.height$.next(height)
    return this.storage.set('mvs_height', height)
  }

  async getHeight() {
    return await this.storage.get('mvs_height') || 0
  }

  getLastTxHeight() {
    return this.storage.get('mvs_last_tx_height').then((height) => (height) ? height : 0)
  }

  setLastTxHeight(height) {
    return this.storage.set('mvs_last_tx_height', height)
  }

  async getAddresses() : Promise<string[]> {
    return await this.storage.get('mvs_addresses') || []
  }

  async updateFees() {
    const fees = await this.blockchain.fee()
    await this.setFees(fees)
    return this.getFees()
  }

  setFees(fees) {
    return this.storage.set('mvs_fees', fees)
  }

  getFees() {
    return this.storage.get('mvs_fees').then((fees) => (fees) ? fees : this.appService.default_fees)
  }

  async hardReset() {
    this.syncing$.next(false)
    const [theme, language, saved_accounts] = await Promise.all([
      this.storage.get('theme'),
      this.storage.get('language'),
      this.storage.get('saved_accounts'),
    ])
    await this.storage.clear()
    return Promise.all([
      this.storage.set('language', language),
      this.storage.set('theme', theme),
      this.storage.set('saved_accounts', saved_accounts),
    ])
  }

  async dataReset() {
    this.syncing$.next(false)
    console.info('reset data')
    await Promise.all([
      'mvs_last_tx_height',
      'mvs_height',
      'utxo',
      'last_update',
      'addressbalances',
      'balances',
      'mvs_txs'
    ]
      .map((key) => this.storage.remove(key)))
    console.info('reset done')
  }

  async getNewTxs(addresses: Array<string>, lastKnownHeight: number): Promise<any> {
    const newTxs = await this.loadNewTxs(addresses, lastKnownHeight + 1)
    return this.addTxs(newTxs)
  }

  getDbVersion() {
    return this.storage.get('db_version')
  }

  async setDbVersion(version) {
    await this.storage.set('db_version', version)
    return this.getDbVersion()
  }

  getDbUpdateNeeded(): any {
    return this.getDbVersion()
      .then(version => {
        if (version && this.appService.db_version === version) {
          return false
        }
        return this.appService.db_version
      })
  }

  async getTxs() {
    return await this.storage.get('mvs_txs') || []
  }

  async addAddresses(addresses: Array<string>) {
    const newAddresses = (await this.getAddresses()).concat(addresses)
    await this.storage.set('mvs_addresses', newAddresses)
    return newAddresses
  }

  setAddresses(addresses: Array<string>) {
    return this.storage.set('mvs_addresses', addresses)
      .then(() => this.getAddresses())
  }

  async addTxs(newtxs: Array<any>) {
    if (newtxs === undefined || newtxs.length === 0) {
      return newtxs
    }
    let txs = await this.getTxs()
    newtxs = newtxs.sort((a: any, b: any) => a.height - b.height)
    newtxs.forEach((newtx) => {
      const found = this.findTxIndexByHash(txs, newtx.hash)
      if (found == -1) {
        txs = [newtx].concat(txs)
      } else {
        txs[found] = newtx
      }
    })
    await this.storage.set('mvs_txs', txs)
    let lastTxHeight = txs[0].height
    for (const tx of txs) {
      if (!tx.unconfirmed) {
        lastTxHeight = tx.height
        break
      }
    }
    await this.setLastTxHeight(lastTxHeight)

    return newtxs
  }

  private findTxIndexByHash(txs, hash) {
    for (let i = 0; i < txs.length; i++) {
      if (txs[i].hash === hash) {
        return i
      }
    }
    return -1
  }

  getTickers = () => {
    return this.blockchain.pricing.tickers()
  }

  async getBaseAndTickers() {
    const base = await this.appService.getBaseCurrency()
    const tickersObj = {}
    const tickersArray = await this.getTickers()
    Object.keys(tickersArray).forEach((symbol) => {
      const ticker: BaseTickers = tickersArray[symbol]
      tickersObj[symbol] = ticker
    })
    return [base, tickersObj]
  }

  assetOrder() {
    return this.storage.get('asset_order')
      .then((_: string[]) => {
        if (_) {
          return _
        }
        else {
          return this.getBalances().then((balances: any) => {
            const order: string[] = Object.keys(balances.MST)
            return this.setAssetOrder(order)
          })
        }
      })
  }

  setAssetOrder(orderList) {
    return this.storage.set('asset_order', orderList)
      .then(() => this.assetOrder())
  }

  setHiddenMst(hiddenMstList) {
    return this.storage.set('hidden_mst', hiddenMstList)
  }

  getHiddenMst() {
    return this.storage.get('hidden_mst')
      .then((hiddenMstList) => (hiddenMstList) ? hiddenMstList : [])
  }

  async addAssetsToAssetOrder(names: string[]) {
    const order = await this.assetOrder()
    names.forEach(symbol => {
      if (order.indexOf(symbol) === -1) {
        order.push(symbol)
      }
    })
    return await this.setAssetOrder(order)
  }

  async sign(transaction: string, passphrase: string, throwWhenUnknown: boolean = true) {
    const wallet = await this.wallet.getWallet(passphrase)
    const signed = await wallet.sign(transaction, throwWhenUnknown)
    return signed
  }

  send = async (tx) => {
    tx.inputs.forEach((input) => {
      if (typeof input.script == 'string') {
        input.script = Metaverse.script.fromASM(input.script).chunks
      }
    })
    tx.hash = (await this.broadcast(tx.encode().toString('hex'))).hash
    tx.height = await this.getHeight()
    tx.unconfirmed = true
    tx.outputs.forEach(output => {
      output.unconfirmed = true
    })
    tx = await this.organizeTx(tx)
    return this.addTxs([tx])
      .then(() => this.getData())
      .then(() => tx)

  }

  broadcast(rawtx: string, max_fee: number = undefined) {
    return this.blockchain.transaction.broadcast(rawtx)
  }

  suggestAvatar(prefix) {
    return this.blockchain.suggest.avatar(prefix)
  }

  suggestAddress(prefix) {
    return this.blockchain.suggest.address(prefix)
  }

  suggestMIT(prefix) {
    return this.blockchain.suggest.mit(prefix)
  }

  getdictionary(lang) {
    return Metaverse.wallet.wordlists[lang]
  }

  checkmnemonic(mnemonic, wordlist) {
    return Metaverse.wallet.validateMnemonic(mnemonic, wordlist)
  }

  verifyMessageSize(message) {
    return Metaverse.message.size(message)
  }

  getWhitelist() {
    return this.storage.get('eth_swap')
      .then((eth_swap) => {
        let current_time = new Date()
        if (!eth_swap || !eth_swap.whitelist || eth_swap.last_update == undefined || (eth_swap.last_update !== undefined && current_time.getTime() - new Date(eth_swap.last_update).getTime() > 3600000)) {
          return this.blockchain.bridge.whitelist()
            .then((whitelist) => {
              this.setWhitelist(whitelist, current_time)
              return whitelist
            })
        } else {
          return eth_swap.whitelist
        }
      })
      .catch((error) => {
        console.error(error)
        throw Error('ERR_GET_WHITELIST')
      })
  }

  setWhitelist(whitelist, current_time) {
    let eth_swap: any = {}
    eth_swap.whitelist = whitelist
    eth_swap.last_update = current_time
    return this.storage.set('eth_swap', eth_swap)
  }

  getBlocktime(current_height) {
    const downscale = 10
    return this.storage.get('blocktime')
      .then((blocktime) => {
        if (blocktime == undefined || blocktime.height == undefined || current_height > blocktime.height + 1000) {
          return this.blockchain.block.blocktime(downscale)
            .then((time) => {
              this.setBlocktime(time, current_height)
              return time
            })

        } else {
          return blocktime.time
        }
      })
      .catch((error) => {
        console.error(error)
        throw Error('ERR_GET_BLOCKTIME')
      })
  }

  setBlocktime(time, height) {
    return this.storage.set('blocktime', { time, height })
  }


  addMultisigWallet(wallet) {
    return this.blockchain.multisig.add(wallet)
  }

  getMultisigWallet(address) {
    return this.blockchain.multisig.get(address)
  }

  getCert(symbol, type) {
    return this.blockchain.cert.get(symbol, type)
  }

  getOutput(hash, index) {
    return this.blockchain.output.get(hash, index)
  }

  async decodeTx(rawtx) {
    const network = await this.appService.getNetwork()
    const tx = Metaverse.transaction.decode(rawtx, network)
    return this.organizeInputs(tx, true)
  }

  async getTransactionMap() {
    return keyBy(await this.getTxs(), 'hash')
  }

  async organizeInputs(tx, getForeignInputs, transactionMap?) {
    if (transactionMap === undefined) {
      transactionMap = await this.getTransactionMap()
    }
    tx.inputs = await Promise.all(tx.inputs.map(input => this.organizeInput(input, getForeignInputs, transactionMap)))
    return tx
  }

  async organizeInput(input, getForeignInput: boolean, transactionMap?) {
    if (input.previous_output == undefined) {
      throw Error('Previous output must be present')
    }
    if (input.previous_output.hash === '0000000000000000000000000000000000000000000000000000000000000000') {
      return input
    }
    if (transactionMap === undefined) {
      transactionMap = await this.getTransactionMap()
    }

    const tx = transactionMap[input.previous_output.hash]
    if (tx !== undefined) {
      input = this.addInputData(input, tx.outputs[input.previous_output.index])
      return input
    }


    if (getForeignInput) {
      input = this.addInputData(input, await this.getOutput(input.previous_output.hash, input.previous_output.index))
      return input
    }

    return input
  }

  addInputData(existingInputData, previousOutputData) {
    if (previousOutputData) {
      existingInputData.previous_output.script = previousOutputData.script
      existingInputData.previous_output.address = previousOutputData.address
      existingInputData.previous_output.value = previousOutputData.value
      existingInputData.previous_output.attachment = previousOutputData.attachment
      existingInputData.address = previousOutputData.address
    }
    return existingInputData
  }

  async organizeTx(tx) {
    const balances = await this.getBalances()
    tx.outputs.forEach((output, index) => {
      output.index = index
      output.locked_height_range = (output.locktime) ? output.locktime : 0
      output.locked_until = (output.locktime) ? tx.height + output.locked_height_range : 0

      switch (output.attachment.type) {
        case Metaverse.constants.ATTACHMENT.TYPE.ETP_TRANSFER:
          output.attachment.type = 'etp'
          output.attachment.symbol = 'ETP'
          output.attachment.decimals = 8
          break
        case Metaverse.constants.ATTACHMENT.TYPE.MST:
          switch (output.attachment.status) {
            case Metaverse.constants.MST.STATUS.REGISTER:
              output.attachment.type = 'asset-issue'
              output.attachment.decimals = output.attachment.precision != undefined ? output.attachment.precision : output.attachment.decimals
              output.attachment.quantity = output.attachment.max_supply ? output.attachment.max_supply : output.attachment.original_quantity
              break
            case Metaverse.constants.MST.STATUS.TRANSFER:
              output.attachment.type = 'asset-transfer'
              if (balances && balances.MST && balances.MST[output.attachment.symbol]) {
                output.attachment.decimals = balances.MST[output.attachment.symbol].decimals
              }
              if (output.attenuation) {
                const attenuationObject: any = {}
                const attenuationArray = output.attenuation.model.split(';')
                attenuationArray.forEach(param => {
                  const temp = param.split('=')
                  attenuationObject[temp[0]] = temp[1]
                })
                output.attenuation_model_param = {
                  current_period_nbr: parseInt(attenuationObject.PN),
                  lock_period: parseInt(attenuationObject.LP),
                  lock_quantity: parseInt(attenuationObject.LQ),
                  next_interval: parseInt(attenuationObject.LH),
                  total_period_nbr: parseInt(attenuationObject.UN),
                  type: parseInt(attenuationObject.TYPE),
                }
                if (attenuationObject.IR) {
                  output.attenuation_model_param.inflation_rate = parseInt(attenuationObject.IR)
                }
                if (attenuationObject.UC && attenuationObject.UQ) {
                  const numbers = attenuationObject.UC.split(',')
                  const quantities = attenuationObject.UQ.split(',')
                  const locked = []
                  for (let i = 0; i < numbers.length; i++) {
                    locked.push({
                      number: parseInt(numbers[i]),
                      quantity: parseInt(quantities[i])
                    })
                  }
                  output.attenuation_model_param.locked = locked
                }
                output.height = tx.height
              }
              break
          }
          break
        case Metaverse.constants.ATTACHMENT.TYPE.MESSAGE:
          output.attachment.type = 'message'
          output.attachment.content = output.attachment.message
          break
        case Metaverse.constants.ATTACHMENT.TYPE.AVATAR:
          switch (output.attachment.status) {
            case Metaverse.constants.AVATAR.STATUS.REGISTER:
              output.attachment.type = 'did-register'
              break
            case Metaverse.constants.AVATAR.STATUS.TRANSFER:
              output.attachment.type = 'did-transfer'
              break
            default:
              throw Error('Avatar status unknown')
          }
          break
        case Metaverse.constants.ATTACHMENT.TYPE.CERT:
          output.attachment.type = 'asset-cert'
          switch (output.attachment.cert) {
            case Metaverse.constants.CERT.TYPE.ISSUE:
              output.attachment.cert = 'issue'
              break
            case Metaverse.constants.CERT.TYPE.DOMAIN:
              output.attachment.cert = 'domain'
              break
            case Metaverse.constants.CERT.TYPE.NAMING:
              output.attachment.cert = 'naming'
              break
            case Metaverse.constants.CERT.TYPE.MINING:
              output.attachment.cert = 'mining'
              break
            default:
              throw Error('Cert type unknown')
          }
          break
        case Metaverse.constants.ATTACHMENT.TYPE.MIT:
          output.attachment.type = 'mit'
          switch (output.attachment.status) {
            case Metaverse.constants.MIT.STATUS.REGISTER:
              output.attachment.status = 'registered'
              break
            case Metaverse.constants.MIT.STATUS.TRANSFER:
              output.attachment.status = 'transfered'
              break
            default:
              throw Error('MIT status unknown')
          }
          break
        case Metaverse.constants.ATTACHMENT.TYPE.COINSTAKE:
          output.attachment.type = 'coinstake'
          break
        default:
          throw Error('What kind of output is that?!')
      }
    })
    return tx
  }

  getSignatureStatus(transaction, inputIndex, redeem, targetPublicKey) {
    return Metaverse.multisig.getSignatureStatus(transaction, inputIndex, redeem, Metaverse.networks[this.appService.network], targetPublicKey)
  }

  getExplorerIconsList() {
    return this.blockchain.MST.icons()
      .catch((error) => {
        return { MST: [], MIT: [] }
      })
  }

  async getDefaultIcon() {
    const icons = {
      MST: {},
      MIT: {},
    }
    const order = (await this.storage.get('asset_order')) || []
    const localIconsList = await this.wallet.getIcons()
    order.forEach((symbol: string) => {
      if (localIconsList.MST.indexOf(symbol) !== -1) {
        icons.MST[symbol] = 'assets/icon/' + symbol + '.png'
      } else {
        icons.MST[symbol] = 'assets/icon/default_mst.png'
      }
    })
    return icons
  }

  getElectionInfo() {
    return this.blockchain.election.electionInfo()
      .catch((error) => {
        return []
      })
  }

  getBlock(height) {
    return this.blockchain.block.get(height)
  }

}
