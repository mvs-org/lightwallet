import { Injectable } from '@angular/core';
import Metaverse from 'metaversejs/dist/metaverse.js';
import { AES, enc } from 'crypto-js';
import { ConfigService } from './config.service';
import { Storage } from '@ionic/storage';
import { Buffer } from 'buffer';
import { MetaverseService, Balances } from './metaverse.service';
import { BehaviorSubject } from 'rxjs';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { map } from 'rxjs/operators';
import { merge } from 'lodash';

export interface GeneratedWallet {
  mnemonic: string;
}

export interface EncryptedWallet {
  mnemonic: string;
  algo: string;
  index: number;
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  addresses$ = new BehaviorSubject<string[]>(['MSCHL3unfVqzsZbRVCJ3yVp7RgAmXiuGN3', 'abc']);

  constructor(
    private config: ConfigService,
    private storage: Storage,
  ) {
  }

  balances = (metaverse: MetaverseService) => combineLatest([
    metaverse.utxos$(this.addresses$),
    this.addresses$,
    metaverse.height$
  ])
    .pipe(
      map(([utxos, addresses, currentHeight]) => {
        return metaverse.blockchain.balance.all(utxos, addresses, currentHeight);
      }),
      map((balances: Balances) => merge(
        this.config.defaultBalances,
        balances,
        )),
    )

  addressBalances = (metaverse: MetaverseService) => combineLatest([
    metaverse.utxos$(this.addresses$),
    this.addresses$,
    metaverse.height$,
  ])
    .pipe(
      map(([utxos, addresses, currentHeight]) => {
        return metaverse.blockchain.balance.addresses(utxos, addresses, currentHeight);
      })
    )

  async getAddresses() {
    return await this.storage.get('addresses') || ['MSCHL3unfVqzsZbRVCJ3yVp7RgAmXiuGN3', 'abc'];
  }

  async generateWallet(): Promise<GeneratedWallet> {
    const mnemonic = await Metaverse.wallet.generateMnemonic();
    return { mnemonic };
  }

  async generateAddresses(hdNode: any, startIndex: number, count: number) {
    const addresses = [];
    for (let i = startIndex; i < startIndex + count; i++) {
      addresses.push(await this.generateAddress(hdNode, i));
    }
    return addresses;
  }

  async getPublicKeyByAddress(wallet: any, address: string) {
    return wallet.findPublicKeyByAddess(address, 200);
  }

  async generateAddress(hdNode: any, index: number) {
    return hdNode.getAddress(index);
  }

  async setIndex(index: number) {
    const wallet = await this.storage.get('wallet');
    wallet.index = index;
    return this.storage.set('wallet', wallet);
  }

  async getAddressIndex() {
    return (await this.storage.get('wallet')).index;
  }

  async getHDNode(passphrase: string) {
    const seed = await this.decryptData(await this.storage.get('seed'), passphrase);
    return this.getHDNodeFromSeed(Buffer.from(seed, 'hex'));
  }

  async import(encryptedWallet: EncryptedWallet, passphrase: string) {
    const mnemonic = await this.decryptData(encryptedWallet.mnemonic, passphrase);
    const seed = await Metaverse.wallet.mnemonicToSeed(mnemonic, Metaverse.networks[this.config.network]);
    await this.storage.set('wallet', JSON.stringify(encryptedWallet));
    return this.storage.set('seed', await this.encryptData(seed, passphrase));
  }

  private getHDNodeFromSeed(seed: any) {
    return Metaverse.wallet.fromSeed(seed, Metaverse.networks[this.config.network]);
  }

  async mnemonicToSeed(mnemonic: string, format?: string) {
    const seed = await Metaverse.wallet.mnemonicToSeed(mnemonic, Metaverse.networks[this.config.network]);
    return seed.toString(format || 'hex');
  }

  async exportWallet(wallet: { mnemonic: string }): Promise<EncryptedWallet> {
    return { version: this.config.version, algo: 'aes', index: this.config.defaultAddresses, ...wallet };
  }

  async encryptWallet(wallet: GeneratedWallet, passphrase: string): Promise<EncryptedWallet> {
    return this.exportWallet({ mnemonic: await this.encryptData(wallet.mnemonic, passphrase) });
  }

  async decryptData(data: string, passphrase: string) {
    return JSON.parse(AES.decrypt(data, passphrase).toString(enc.Utf8));
  }

  async encryptData(data: any, passphrase: string) {
    return AES.encrypt(JSON.stringify(data), passphrase).toString();
  }

}
