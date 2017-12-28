import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AppGlobals } from '../../app/app.global';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import * as Metaverse from 'metaversejs/dist/metaverse.js';
import { CryptoServiceProvider } from '../crypto-service/crypto-service';

@Injectable()
export class WalletServiceProvider {

    constructor(public http: Http, private storage: Storage, private globals: AppGlobals, private crypto: CryptoServiceProvider) { }

    public export(passphrase) {
        return this.getMnemonic(passphrase)
            .then((mnemonic) => Metaverse.wallet.mnemonicToSeed(mnemonic, Metaverse.networks[this.globals.network]))
            .then((seed) => this.crypto.encrypt(seed.toString('hex'), passphrase))
    }

    exportMemonic() {
        return this.storage.get('wallet')
    }

    isSetup = () => {
        return this.storage.get('wallet')
            .then((wallet) => (wallet != undefined && wallet.index))
    }

    getMnemonic(passphrase) {
        return this.storage.get('wallet')
            .then((wallet) => this.crypto.decrypt(wallet.mnemonic, passphrase))
            .catch((error) => {
                console.error(error)
                throw Error('ERR_DECRYPT_WALLET')
            })
    }

    setWallet(wallet) {
        return this.storage.set('wallet', wallet)
    }

    getWallet(passphrase) {
        return this.getSeed(passphrase)
            .then((seed: string) => this.getHDNodeFromSeed(Buffer.from(seed, 'hex')))
            .catch((error) => {
                console.error(error)
                return this.getMnemonic(passphrase)
                    .then((mnemonic) => this.getHDNodeFromMnemonic(mnemonic))
            })
    }

    getHDNodeFromMnemonic(mnemonic) {
        return Metaverse.wallet.fromMnemonic(mnemonic)
    }

    getHDNodeFromSeed(seed) {
        return Metaverse.wallet.fromSeed(seed, Metaverse.networks[this.globals.network])
    }

    setMobileWallet(seed) {
        return this.storage.set('seed', seed)
    }

    setSeed(passphrase) {
        return this.getMnemonic(passphrase)
            .then((mnemonic) => Metaverse.wallet.mnemonicToSeed(mnemonic, Metaverse.networks[this.globals.network]))
            .then((seed) => this.crypto.encrypt(seed.toString('hex'), passphrase))
            .then((encseed) => this.storage.set('seed', encseed))
    }

    setSeedMobile(passphrase, mnemonic) {
        return Metaverse.wallet.mnemonicToSeed(mnemonic, Metaverse.networks[this.globals.network])
            .then((seed) => this.crypto.encrypt(seed.toString('hex'), passphrase))
            .then((encseed) => this.storage.set('seed', encseed))
    }

    getSeed(passphrase) {
        console.info('loading seed')
        return this.storage.get('seed')
            .then((seed) => this.crypto.decrypt(seed, passphrase))
            .catch((error) => {
                console.error(error)
                throw Error('ERR_DECRYPT_WALLET_FROM_SEED')
            })
    }


    exportWallet() {
        return this.storage.get('seed')
            .then((seed) => {
                return seed + "&" + this.globals.network.charAt(0);
            })
            .catch((error) => {
                console.error(error)
                throw Error('ERR_DECRYPT_WALLET')
            })
    }

}
