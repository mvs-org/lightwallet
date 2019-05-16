import { Injectable } from '@angular/core';
import { combineLatest } from 'rxjs/observable/combineLatest';
import Metaverse from 'metaversejs/dist/metaverse.js';
import { WalletService } from './wallet.service';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { MetaverseService } from './metaverse.service';
import { map } from 'rxjs/operators';

export interface MultisigWallet {
  m: number; // mininum number of required signatures
  k: string[]; // public keys
  r?: string; // redeem script
  a?: string; // address
}

@Injectable({
  providedIn: 'root'
})
export class MultisigService {

  addresses$ = new BehaviorSubject<string[]>([]);

  constructor(
    private storage: Storage,
    private wallet: WalletService,
  ) { }

  multisigAddressBalances$ = (metaverse: MetaverseService) => combineLatest([
      metaverse.utxos$,
      this.addresses$,
      metaverse.height$,
    ])
      .pipe(
        map(([utxos, addresses, currentHeight]) => {
          return metaverse.blockchain.balance.addresses(utxos, addresses, currentHeight);
        })
      )

  async signMultisigTx(address: string, tx: any, passphrase: string) {
    const wallet = await this.wallet.getHDNode(passphrase);
    const parameters = await this.getMultisigInfoFromAddress(address);
    return wallet.signMultisig(tx, parameters)
      .catch((error: any) => {
        console.error(error);
        switch (error) {
          case 'Signature already included':
            throw Error('SIGN_ALREADY_INCL');
          default:
            throw Error('ERR_SIGN_TX');
        }
      });
  }

  getNewMultisigAddress(nbrSigReq: number, publicKeys: string[]) {
    return Metaverse.multisig.generate(nbrSigReq, publicKeys);
  }

  async getMultisigAddresses() {
    return await this.storage.get('multisig_addresses') || [];
  }

  async addMultisigAddresses(newAddresses: string[]) {
    const addresses = await this.getMultisigAddresses();
    return this.storage.set('multisig_addresses', addresses.concat(newAddresses));
  }

  async addMultisig(newMultisig: MultisigWallet) {
    const addresses = await this.getMultisigAddresses();
    if (addresses.indexOf(newMultisig.a) === -1) {
      await this.addMultisigAddresses([newMultisig.a]);
      await this.addMultisigInfo([newMultisig]);
    }
    return;
  }

  async addMultisigInfo(newMultisigs: Array<any>) {
    const storedMultisigs: MultisigWallet[] = await this.getMultisigsInfo();
    const multisigs = newMultisigs.map(multisig => {
      multisig.r = Metaverse.multisig.generate(multisig.m, multisig.k).script;
      return multisig;
    }).concat(storedMultisigs);
    return this.storage.set('multisigs', multisigs);
  }

  setMultisigInfo(multisigs: Array<any>) {
    if (multisigs === undefined) {
      multisigs = [];
    }
    return this.storage.set('multisigs', multisigs);
  }

  async getMultisigsInfo() {
    return await this.storage.get('multisigs') || [];
  }

  async getMultisigInfoFromAddress(address: string) {
    const multisigs = await this.getMultisigsInfo();
    return this.findMultisigWallet(address, multisigs);
  }

  findMultisigWallet(address: string, wallets: MultisigWallet[]) {
    for (const wallet of wallets) {
      if (wallet.a === address) {
        return wallet;
      }
    }
    throw Error('wallet not found');
  }
}
