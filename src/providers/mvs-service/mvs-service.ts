import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { AppGlobals } from '../../app/app.global';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { WalletServiceProvider } from '../wallet-service/wallet-service';
import * as Metaverse from 'metaversejs/dist/metaverse.js';
import * as Blockchain from 'mvs-blockchain/dist/index.js';

@Injectable()
export class MvsServiceProvider {

    private blockchain;

    DEFAULT_BALANCES = {
        "ETP": { frozen: 0, available: 0, decimals: 8 },
        "MVS.ZGC": { frozen: 0, available: 0, decimals: 8 },
        "MVS.ZDC": { frozen: 0, available: 0, decimals: 6 },
        "CSD.CSD": { frozen: 0, available: 0, decimals: 8 },
        "PARCELX.GPX": { frozen: 0, available: 0, decimals: 8 },
        "SDG": { frozen: 0, available: 0, decimals: 8 },
    }

    constructor(
        public globals: AppGlobals,
        private wallet: WalletServiceProvider,
        private event: Events,
        private storage: Storage
    ) {
        this.blockchain = Blockchain(globals.host[globals.network])
    }

    createSendTx(passphrase, asset, recipient_address, quantity, from_address, change_address) {
        let target = {};
        target[asset] = quantity;
        return this.wallet.getWallet(passphrase)
            .then(wallet => this.getUtxoFrom(from_address)
                .then((utxo) => this.getHeight().then(height => Metaverse.transaction_builder.findUtxo(utxo, target, height)))
                .then((result) => {
                    //Set change address to first utxo's address
                    if (change_address == undefined)
                        change_address = result.utxo[0].address;
                    return Metaverse.transaction_builder.send(result.utxo, recipient_address, target, change_address, result.change);
                })
                .then((tx) => wallet.sign(tx)))
            .catch((error) => {
                console.error(error)
                throw Error(error.message);
            })
    }

    createDepositTx(passphrase, recipient_address, quantity, locktime, from_address, change_address) {
        let target = { ETP: quantity };
        return this.wallet.getWallet(passphrase)
            .then(wallet => this.getUtxoFrom(from_address)
                .then((utxo) => this.getHeight().then(height => Metaverse.transaction_builder.findUtxo(utxo, target, height)))
                .then((result) => {
                    //Set change address to first utxo's address
                    if (change_address == undefined)
                        change_address = result.utxo[0].address;
                    if (recipient_address == undefined)
                        recipient_address = result.utxo[0].address;
                    return Metaverse.transaction_builder.deposit(result.utxo, recipient_address, parseInt(quantity), parseInt(locktime), change_address, result.change, undefined, Metaverse.networks[this.globals.network]);
                })
                .then((tx) => wallet.sign(tx)))
            .catch((error) => {
                console.error(error)
                throw Error(error.message);
            })
    }

    createIssueAssetTx(passphrase, symbol, issuer, max_supply, precision, description, issue_address, fee_address, change_address) {
        throw Error('Not implemented');
    }


    validAddress = (address) => {
        if (address.length != 34)
            return false
        let valid = false
        switch (address.charAt(0)) {
            case this.globals.ADDRESS_PREFIX_MAINNET:
                valid = this.globals.network == "mainnet"
                break
            case this.globals.ADDRESS_PREFIX_TESTNET:
                valid = this.globals.network == "testnet"
                break
            case this.globals.ADDRESS_PREFIX_P2SH:
                valid = true
        }
        return valid
    }

    updateHeight() {
        return this.blockchain.height()
            .then((height) => this.setHeight(height))
            .then(() => this.getHeight())
    }

    getUtxo() {
        return this.getTxs()
            .then((txs: Array<any>) => txs.sort(function(a, b) {
                return b.height - a.height;
            }))
            .then(txs => this.getAddresses()
                .then(addresses => Metaverse.transaction_builder.calculateUtxo(txs, addresses)));
    }

    getUtxoFrom(address) {
        return this.getUtxo()
            .then((utxo: Array<any>) => {
                if (address) {
                    let result = [];
                    if (utxo.length) {
                        utxo.forEach((output) => {
                            if (output.address == address) result.push(output)
                        })
                    }
                    return result;
                } else {
                    return utxo;
                }
            })
    }

    getBalances() {
        return this.storage.get('balances')
            .then((balances: Array<any>) => {
                let b = JSON.parse(JSON.stringify(this.DEFAULT_BALANCES));
                if (balances && Object.keys(balances).length)
                    Object.keys(balances).forEach((asset) => {
                        b[asset] = balances[asset];
                    })
                return b;
            })
    }

    loadNewTxs(addresses, start) {
        return this.blockchain.addresses.txs(addresses, { min_height: start })
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
                //Check if balance has been changed
                let nb = JSON.parse(JSON.stringify(this.DEFAULT_BALANCES));
                Object.keys(newBalances).forEach((asset) => {
                    nb[asset] = newBalances[asset];
                })
                if (JSON.stringify(balances) != JSON.stringify(nb)) {
                    return this.storage.set('balances', newBalances)
                }
            })
    }

    getData(): Promise<any> {
        var balances: {};
        return this.getBalances()
            .then(_ => {
                balances = _;
                return Promise.all([this.getAddresses(), this.getLastTxHeight(), this.getHeight(), this.getTxs()])
            })
            .then(results => { return this.getNewTxs(results[0], results[1], results[3]) })
            .then(() => this.calculateBalances())
            .then(() => { return balances })
    }

    getUpdateNeeded() {
        return new Promise((resolve, reject) => {
            var UPDATE_INTERVAL = 20
            this.getUpdateTime()
                .then((date: Date) => {
                    var now = new Date()
                    resolve(typeof date === 'undefined' || (+now - +date) / 1000 > UPDATE_INTERVAL)
                }, reject)
        })
    }

    calculateBalances() {
        return Promise.all([this.getTxs(), this.getHeight(), this.getAddresses()])
            .then((results: any) => Promise.all([
                this.blockchain.balance.all(results[0], results[2], results[1]),
                this.blockchain.balance.addresses(results[0], results[2], results[1])
            ]))
            .then((balances) => Promise.all([
                this.setBalances(balances[0]),
                this.setAddressBalances(balances[1])
            ]))
    }

    setUpdateTime(lastupdate = undefined) {
        if (lastupdate == undefined)
            lastupdate = new Date()
        return this.storage.set('last_update', lastupdate)
    }

    getUpdateTime() {
        return this.storage.get('last_update')
    }

    setHeight(height) {
        return this.storage.set('mvs_height', height)
    }

    getHeight() {
        return this.storage.get('mvs_height').then((height) => (height) ? height : 0)
    }

    setLoaded(bool) {
        return this.storage.set('loaded', bool)
    }

    getLoaded() {
        return this.storage.get('loaded').then((loaded) => (loaded) ? loaded : false)
    }

    getLastTxHeight() {
        return this.storage.get('mvs_last_tx_height').then((height) => (height) ? height : 0)
    }

    setLastTxHeight(height) {
        return this.storage.set('mvs_last_tx_height', height);
    }

    getAddresses() {
        return this.storage.get('mvs_addresses')
            .then((addresses) => (addresses) ? addresses : [])
    }

    hardReset() {
        return this.storage.get('theme')
            .then((theme: any) => {
                return this.storage.get('language')
                    .then((language: any) => {
                        this.storage.clear()
                            .then(() => {
                                this.event.publish('settings_update', {});
                                return Promise.all([this.storage.set('language', language), this.storage.set('theme', theme)]);
                            })
                    })
            });
    }

    dataReset() {
        return Promise.all(['mvs_last_tx_height', 'mvs_height', 'utxo', 'last_update', 'addressbalances', 'balances', 'mvs_txs'].map((key) => this.storage.remove(key)))
    }

    getNewTxs(addresses, lastKnownHeight, txs): Promise<any> {
        if (typeof txs == 'undefined')
            txs = []
        return this.loadNewTxs(addresses, lastKnownHeight + 1)
            .then((newTxs: any) => {
                txs = txs.concat(newTxs.transactions)
                return this.addTxs(txs).then(() => txs)
            })
    }

    getTxs() {
        return this.storage.get('mvs_txs')
            .then((txs) => (txs) ? txs : [])
    }

    addAddresses(addresses) {
        return this.getAddresses()
            .then((addr: any[]) => this.storage.set('mvs_addresses', addr.concat(addresses)))
            .then(() => this.getAddresses())
            .then(() => this.event.publish('settings_update', {}))
    }

    setAddresses(addresses) {
        return this.storage.set('mvs_addresses', addresses)
            .then(() => this.getAddresses())
            .then(() => this.event.publish('settings_update', {}))
    }

    addTxs(newtxs) {
        return this.getTxs()
            .then((txs: any[]) => {
                if (newtxs.length)
                    newtxs.forEach((newtx) => {
                        let found = 0;
                        txs.forEach((oldtx) => {
                            if (newtx.hash == oldtx.hash)
                                found = 1;
                        })
                        if (found == 0) {
                            txs.push(newtx)
                        }
                    })
                return this.storage.set('mvs_txs', txs)
            })
            .then(() => {
                if (newtxs.length)
                    this.setLastTxHeight(newtxs[0].height)
                return this.getTxs()
            })
    }


    assetOrder() {
        return this.storage.get('asset_order')
            .then((_: string[]) => {
                if (_)
                    return Promise.resolve(_)
                else {
                    return this.getBalances().then((balances: any) => {
                        let order: string[] = Object.keys(balances)
                        return this.setAssetOrder(order);
                    })
                }
            })
    }

    setAssetOrder(orderList) {
        return this.storage.set('asset_order', orderList)
            .then(() => this.assetOrder())
    }

    addAssetToAssetOrder(name) {
        this.assetOrder()
            .then((_: string[]) => {
                if (_.indexOf(name) === -1)
                    _.push(name)
                return this.setAssetOrder(_)
            })
            .then(() => this.assetOrder())
    }

    broadcast(rawtx, max_fee = undefined) {
        return this.blockchain.transaction.broadcast(rawtx)
            .catch((error) => {
                if (error.message == 'ERR_CONNECTION')
                    throw Error(error.message)
                else
                    throw Error('ERR_BROADCAST')
            })
    }
}
