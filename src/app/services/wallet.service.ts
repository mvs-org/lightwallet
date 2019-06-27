import { Injectable } from '@angular/core'
import Metaverse from 'metaversejs/dist/metaverse.js'
import { AES, enc } from 'crypto-js'
import { ConfigService } from './config.service'
import { Buffer } from 'buffer'
import { MetaverseService } from './metaverse.service'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs/observable/combineLatest'
import { map, take } from 'rxjs/operators'
import { merge, Dictionary } from 'lodash'
import { DatastoreService } from './datastore.service'

export interface Balance {
  frozen: number
  available: number
  decimals: number
}

export interface Balances {
  ETP: Balance
  MST: {
    [symbol: string]: Balance
  }
  MIT: any[]
  AVATAR?: string
  ADDRESS?: string
  IDENTIFIER?: string
}

export interface GeneratedWallet {
  mnemonic: string
}

export interface EncryptedWallet {
  mnemonic: string
  algo: string
  index: number
  version: string
}

@Injectable({
  providedIn: 'root',
})
export class WalletService {


  constructor(
    private config: ConfigService,
    // private storage: Storage,
    private datastore: DatastoreService,
  ) {
  }

  async addresses$() {
    const collection = await this.datastore.configCollection()
    return collection.findOne().where('key').equals('addresses').$.pipe(map(conf => conf ? conf.toJSON().value : []))
  }
  async reset() {
    const configCollection = await this.datastore.configCollection()
    await configCollection.findOne().where('key').equals('wallet').exec()
      .then(record => record ? record.remove() : null)
    configCollection.findOne().where('key').equals('addresses').exec()
      .then(record => record ? record.remove() : null)
    configCollection.findOne().where('key').equals('seed').exec()
      .then(record => record ? record.remove() : null)
  }

  balances = async (metaverse: MetaverseService) => combineLatest([
    await metaverse.utxoStream(await this.addresses$()),
    await this.addresses$(),
    metaverse.height$,
  ])
    .pipe(
      map(([utxos, addresses, currentHeight]) => {
        return metaverse.blockchain.balance.all(utxos, addresses, currentHeight)
      }),
      map((balances: Balances) => merge(
        this.config.defaultBalances,
        balances,
      )),
    )

  addressBalances = async (metaverse: MetaverseService): Promise<Observable<Dictionary<Balances>>> => combineLatest([
    await metaverse.utxoStream(await this.addresses$()),
    await this.addresses$(),
    metaverse.height$,
  ])
    .pipe(
      map(([utxos, addresses, currentHeight]) => {
        return metaverse.blockchain.balance.addresses(utxos, addresses, currentHeight)
      }),
    )

  async getAddresses() {
    const collection = await this.datastore.configCollection()
    return collection.findOne().where('key').equals('addresses').$
      .pipe(take(1), map(conf => conf ? conf.toJSON().value : []))
      .toPromise()
  }

  async generateWallet(): Promise<GeneratedWallet> {
    const mnemonic = await Metaverse.wallet.generateMnemonic()
    return { mnemonic }
  }

  async generateAddresses(hdNode: any, startIndex: number, count: number) {
    const addresses = []
    for (let i = startIndex; i < startIndex + count; i++) {
      addresses.push(await this.generateAddress(hdNode, i))
    }
    return addresses
  }

  async getPublicKeyByAddress(wallet: any, address: string) {
    return wallet.findPublicKeyByAddess(address, 200)
  }

  async generateAddress(hdNode: any, index: number) {
    return hdNode.getAddress(index)
  }

  async setIndex(index: number) {
    const collection = await this.datastore.configCollection()
    const wallet = await collection.findOne().where('key').equals('wallet').$
      .pipe(take(1), map(conf => conf.toJSON().value))
      .toPromise()
    wallet.index = index
    return collection.findOne().where('key').equals('wallet').update({ $set: { value: wallet } })
  }

  async getAddressIndex() {
    const collection = await this.datastore.configCollection()
    const wallet = await collection.findOne().where('key').equals('wallet').$
      .pipe(take(1), map(conf => conf.toJSON().value))
      .toPromise()
    return wallet.index
  }

  async getWallet() {
    const collection = await this.datastore.configCollection()
    return collection.findOne().where('key').equals('wallet').$
      .pipe(take(1), map(conf => conf.toJSON().value))
      .toPromise()
  }

  async getSeed() {
    const collection = await this.datastore.configCollection()
    return collection.findOne().where('key').equals('seed').$
      .pipe(take(1), map(conf => conf.toJSON().value))
      .toPromise()
  }

  async setSeed(seed) {
    const collection = await this.datastore.configCollection()
    return collection.insert({ key: 'seed', value: seed })
  }

  async setWallet(seed) {
    const collection = await this.datastore.configCollection()
    return collection.insert({ key: 'wallet', value: seed })
  }

  async getHDNode(passphrase: string, network: string) {
    const seed = await this.decryptData(await this.getSeed(), passphrase)
    return this.getHDNodeFromSeed(Buffer.from(seed, 'hex'), network)
  }

  async setAddresses(addresses) {
    const collection = await this.datastore.configCollection()
    const oldAddresses = await collection.findOne({ key: 'addresses' }).exec()
    if (oldAddresses) {
      console.info('update addresses')
      return await collection.findOne().where('key').equals('addresses').update({ $set: { value: addresses } })
    } else {
      console.info('set addresses')
      return await collection.insert({ key: 'addresses', value: addresses })
    }
  }

  async import(encryptedWallet: EncryptedWallet, passphrase: string, network: string) {
    const mnemonic = await this.decryptData(encryptedWallet.mnemonic, passphrase)
    const seed = await Metaverse.wallet.mnemonicToSeed(mnemonic, Metaverse.networks[network])
    await this.setWallet(encryptedWallet)
    await this.setSeed(await this.encryptData(seed, passphrase))
    const hdNode = await this.getHDNode(passphrase, network)
    const addresses = await this.generateAddresses(hdNode, 0, await this.getAddressIndex())
    return await this.setAddresses(addresses)
  }

  private getHDNodeFromSeed(seed: any, network: string) {
    return Metaverse.wallet.fromSeed(seed, Metaverse.networks[network])
  }

  async exportWallet(wallet: { mnemonic: string }): Promise<EncryptedWallet> {
    return { version: this.config.version, algo: 'aes', index: this.config.defaultAddresses, ...wallet }
  }

  async encryptWallet(wallet: GeneratedWallet, passphrase: string): Promise<EncryptedWallet> {
    return this.exportWallet({ mnemonic: await this.encryptData(wallet.mnemonic, passphrase) })
  }

  async decryptData(data: string, passphrase: string) {
    try {
      return JSON.parse(AES.decrypt(data, passphrase).toString(enc.Utf8))
    } catch (error) {
      console.error(error)
      throw Error('ERR_DECRYPT_WALLET')
    }
  }

  async encryptData(data: any, passphrase: string) {
    return AES.encrypt(JSON.stringify(data), passphrase).toString()
  }

  async getdictionary(lang: 'EN') {
    return Metaverse.wallet.wordlists[lang]
  }

  async checkmnemonic(mnemonic, wordlist) {
    return Metaverse.wallet.validateMnemonic(mnemonic, wordlist)
  }

}
