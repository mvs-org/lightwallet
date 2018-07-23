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

    encryptWalletFromMnemonic(mnemonic, passphrase) {
        return this.crypto.encrypt(mnemonic, passphrase)
            .then((res) => this.dataToKeystoreJson(res))
    }

    dataToKeystoreJson(mnemonic) {
        let tmp = { version: this.globals.version, algo: this.globals.algo, index: this.globals.index, mnemonic: mnemonic };
        return tmp;
    }

    getMstIcons() {
        return ['ETP', 'MVS.ZGC', 'MVS.ZDC', 'CSD.CSD', 'PARCELX.GPX', 'PARCELX.TEST', 'SDG', 'META', 'MVS.HUG', 'RIGHTBTC.RT'];
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

    createWallet() {
        let wallet: any = {};
        return Metaverse.wallet.generateMnemonic()
            .then((mnemonic) => {
                wallet.mnemonic = mnemonic;
                return Metaverse.wallet.mnemonicToSeed(mnemonic, Metaverse.networks[this.globals.network]);
            })
            .then((seed) => {
                wallet.seed = seed.toString('hex');
                return wallet;
            })
            .catch((error) => {
                return Error(error.message);
            })
    }

    getHDNodeFromMnemonic(mnemonic) {
        return Metaverse.wallet.fromMnemonic(mnemonic)
    }

    verifyMessage(message, address, signature){
        return Metaverse.message.verify(message,address,Buffer.from(signature,'hex'))
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
        return Promise.all([this.storage.get('seed'), this.getAddressIndex()])
            .then((results) => {
                return results[0] + "&" + this.globals.network.charAt(0) + "&" + results[1]
            })
            .catch((error) => {
                console.error(error)
                throw Error('ERR_DECRYPT_WALLET')
            })
    }


    setAddressIndex(index) {
        return this.storage.get('wallet')
            .then((wallet) => {
                wallet.index = index
                return this.storage.set('wallet', wallet)
            })
    }

    getAddressIndex() {
        return this.storage.get('wallet')
            .then((wallet) => wallet.index)
    }

    generateNewAddress(wallet: any, index: number) {
        return wallet.getAddress(index);
    }

    generateAddresses(wallet: any, from_index: number, to_index: number) {
        var addresses = [];
        for (let i = from_index; i < to_index; i++) {
            addresses.push(this.generateNewAddress(wallet, i));
        }
        return addresses;
    }

}
