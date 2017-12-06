import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AppGlobals } from '../../app/app.global';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import * as Metaverse from 'metaversejs/dist/metaverse.js';
import * as CryptoJS from 'crypto-js';
/*
  Generated class for the WalletServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class WalletServiceProvider {

    public globals: AppGlobals

    constructor(public http: Http, private storage: Storage) {
        console.log('Hello WalletServiceProvider Provider');
    }


    public decrypt(ec,pincode){
        return new Promise(resolve=>resolve(JSON.parse(CryptoJS.AES.decrypt(ec, pincode).toString(CryptoJS.enc.Utf8))))
    }

    public encrypt(ec,pincode){
        return new Promise(resolve=>resolve(CryptoJS.AES.encrypt(JSON.stringify(ec), pincode).toString()))
    }

    public export(passphrase){
        return this.getMnemonic(passphrase)
        .then((mnemonic)=>Metaverse.wallet.mnemonicToSeed(mnemonic, Metaverse.networks[this.globals.network]))
        .then((seed)=>this.encrypt(seed.toString('hex'),passphrase))
    }

    public exportMemonic(){
        return this.storage.get('wallet')
    }

    getMnemonic(passphrase) {
        return this.storage.get('wallet')
            .then((wallet) => this.decrypt(wallet.mnemonic, passphrase))
            .catch((error) => {
                console.error(error)
                throw Error('ERR_DECRYPT_WALLET')
            })
    }

    getSeed(passphrase) {
        return this.storage.get('wallet')
            .then((wallet) => this.decrypt(wallet.seed, passphrase))
            .catch((error) => {
                console.error(error)
                throw Error('ERR_DECRYPT_WALLET')
            })
    }


}
