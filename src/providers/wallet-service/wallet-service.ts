import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AppGlobals } from '../../app/app.global';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import * as Metaverse from 'metaversejs/index.js';
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
        return ['ETP', 'MVS.ZGC', 'MVS.ZDC', 'CSD.CSD', 'PARCELX.GPX', 'PARCELX.TEST', 'SDG', 'META', 'MVS.HUG', 'RIGHTBTC.RT', 'TIPLR.TPC'];
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

    verifyMessage(message, address, signature) {
        return Metaverse.message.verify(message, address, Buffer.from(signature, 'hex'))
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

    getPublicKeyByAddress(wallet: any, address: string) {
        return wallet.findPublicKeyByAddess(address, 200);
    }

    getNewMultisigAddress(nbrSigReq, publicKeys) {
        return Metaverse.multisig.generate(nbrSigReq, publicKeys);
    }

    addMultisig(newMultisig) {
        return this.getMultisigAddresses()
            .then((multisig_addresses) => {
                if (multisig_addresses.indexOf(newMultisig.a) == -1) {
                    return Promise.all([this.addMultisigAddresses([newMultisig.a]), this.addMultisigInfo([newMultisig])])
                }
            })
    }

    getMultisigsInfo() {
        return this.storage.get('multisigs')
            .then((multisigs) => (multisigs) ? multisigs : [])
    }

    getMultisigInfoFromAddress(address) {
        return this.getMultisigsInfo()
            .then((multisigs) => {
                return this.findMultisigWallet(address, multisigs)
            })
    }

    findMultisigWallet(address, wallets) {
        if (wallets.length == 0)
            throw 'wallet not found';
        return (wallets[0].a == address) ? wallets[0] : this.findMultisigWallet(address, wallets.slice(1));
    }


    addMultisigInfo(newMultisig: Array<any>) {
        return this.getMultisigsInfo()
            .then((multisigs: Array<any>) => {
                newMultisig.map(multisig => {
                    multisig.r = Metaverse.multisig.generate(multisig.m, multisig.k).script
                    return multisig
                })
                this.storage.set('multisigs', multisigs.concat(newMultisig))
            })
    }

    getMultisigAddresses() {
        return this.storage.get('multisig_addresses')
            .then((addresses) => (addresses) ? addresses : [])
    }

    addMultisigAddresses(addresses: Array<string>) {
        return this.getMultisigAddresses()
            .then((addr: Array<string>) => this.storage.set('multisig_addresses', addr.concat(addresses)))
    }

    findDeriveNodeByPublic(wallet: any, publicKey: string, maxDepth: number) {
        return wallet.findDeriveNodeByPublicKey(publicKey, maxDepth ? maxDepth : 200)
    }

    async signMultisigTx(address, tx, passphrase) {
        let wallet = await this.getWallet(passphrase)
        let parameters = await this.getMultisigInfoFromAddress(address)
        return wallet.signMultisig(tx, parameters)
    }

    getAccountName() {
        return this.storage.get('account_name')
            .then((account_name) => {
                return account_name
            })
    }
     setAccountName(account_name) {
        return this.storage.set('account_name', account_name)
    }
     deleteAccount(account_name) {
        return this.storage.get('saved_accounts')
            .then((accounts) => {
                delete accounts[account_name]
                return this.storage.set('saved_accounts', accounts)
            })
            .catch((error) => {
                console.error(error)
                throw Error('ERR_DELETE_ACCOUNT')
            })
    }
     saveAccount(username) {
        return Promise.all([this.storage.get('seed'), this.storage.get('wallet'), this.storage.get('saved_accounts')])
            .then((results) => {
                let accounts = results[2] ? results[2] : {};
                let account_name = username ? username : 'Default'
                accounts[account_name] = {}
                accounts[account_name].seed = results[0]
                accounts[account_name].index = results[1].index
                return this.storage.set('saved_accounts', accounts)
            })
            .catch((error) => {
                console.error(error)
                throw Error('ERR_SAVE_ACCOUNT')
            })
    }
     getSavedAccounts() {
        return this.storage.get('saved_accounts')
    }
     getSavedAccount(account_name) {
        return this.storage.get('saved_accounts')
            .then((accounts) => accounts[account_name])
    }

}
