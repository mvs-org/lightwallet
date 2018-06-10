import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { AppGlobals } from '../../app/app.global';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { WalletServiceProvider } from '../wallet-service/wallet-service';
import * as Metaverse from 'metaversejs/dist/metaverse.js';
import * as Blockchain from 'mvs-blockchain';

@Injectable()
export class MvsServiceProvider {

    private blockchain;

    DEFAULT_BALANCES = {
        ETP: { frozen: 0, available: 0, decimals: 8 },
        MST: {
            "MVS.ZGC": { frozen: 0, available: 0, decimals: 8 },
            "MVS.ZDC": { frozen: 0, available: 0, decimals: 6 },
            "CSD.CSD": { frozen: 0, available: 0, decimals: 8 },
            "PARCELX.GPX": { frozen: 0, available: 0, decimals: 8 },
            "SDG": { frozen: 0, available: 0, decimals: 8 }
        },
        MIT: []
    }

    constructor(
        public globals: AppGlobals,
        private wallet: WalletServiceProvider,
        private event: Events,
        private storage: Storage
    ) {
        this.blockchain = Blockchain({ network: globals.network })
    }

    createSendTx(passphrase: string, asset: string, recipient_address: string, recipient_avatar: string, quantity: number, from_address: string, change_address: string) {
        let target = {};
        target[asset] = quantity;
        return this.wallet.getWallet(passphrase)
            .then(wallet => this.getUtxoFrom(from_address)
                .then((utxo) => this.getHeight().then(height => Metaverse.output.findUtxo(utxo, target, height)))
                .then((result) => {
                    //Set change address to first utxo's address
                    if (change_address == undefined)
                        change_address = result.utxo[0].address;
                    return Metaverse.transaction_builder.send(result.utxo, recipient_address, recipient_avatar, target, change_address, result.change);
                })
                .then((tx) => wallet.sign(tx)))
            .catch((error) => {
                console.error(error)
                throw Error(error.message);
            })
    }

    createDepositTx(passphrase: string, recipient_address: string, quantity: number, locktime: number, from_address: string, change_address: string) {
        let target = { ETP: quantity };
        return this.wallet.getWallet(passphrase)
            .then(wallet => this.getUtxoFrom(from_address)
                .then((utxo) => this.getHeight().then(height => Metaverse.output.findUtxo(utxo, target, height)))
                .then((result) => {
                    //Set change address to first utxo's address
                    if (change_address == undefined)
                        change_address = result.utxo[0].address;
                    if (recipient_address == undefined)
                        recipient_address = result.utxo[0].address;
                    return Metaverse.transaction_builder.deposit(result.utxo, recipient_address, quantity, locktime, change_address, result.change, undefined, Metaverse.networks[this.globals.network]);
                })
                .then((tx) => wallet.sign(tx)))
            .catch((error) => {
                console.error(error)
                throw Error(error.message);
            })
    }

    createAvatarTx(passphrase: string, avatar_address: string, symbol: string, change_address: string) {
        return this.wallet.getWallet(passphrase)
            .then(wallet => this.getUtxoFrom(avatar_address)
                .then((utxo) => this.getHeight().then(height => Metaverse.output.findUtxo(utxo, {}, height, Metaverse.constants.FEE.AVATAR_REGISTER)))
                .then((result) => {
                    //Set change address to first utxo's address
                    if (change_address == undefined)
                        change_address = result.utxo[0].address;
                    return Metaverse.transaction_builder.issueDid(result.utxo, avatar_address, symbol, change_address, result.change);
                })
                .then((tx) => wallet.sign(tx)))
            .catch((error) => {
                console.error(error)
                throw Error(error.message);
            })
    }

    createRegisterMITTx(passphrase: string, recipient_address: string, recipient_avatar, symbol: string, content: string, change_address: string) {
        return this.wallet.getWallet(passphrase)
            .then(wallet => this.getUtxoFrom(recipient_address)
                .then((utxo) => this.getHeight().then(height => Metaverse.output.findUtxo(utxo, {}, height, Metaverse.constants.FEE.DEFAULT)))
                .then((result) => {
                    //Set change address to first utxo's address
                    if (change_address == undefined)
                        change_address = result.utxo[0].address;
                    return Metaverse.transaction_builder.registerMIT(result.utxo, recipient_address, recipient_avatar, symbol, content, change_address, result.change)
                })
                .then((tx) => wallet.sign(tx)))
            .catch((error) => {
                console.error(error)
                throw Error(error.message);
            })
    }

    createIssueAssetTx(passphrase: string, symbol: string, quantity: number, precision: number, issuer: string, description: string, secondaryissue_threshold: number, is_secondaryissue: boolean, issue_address: string, fee_address: string, change_address: string) {
        return ((fee_address) ? this.getUtxoFrom(fee_address) : this.getUtxo())
            .then(utxo => {
                return this.wallet.getWallet(passphrase)
                    .then((wallet) => {
                        return this.getHeight().then(height => Metaverse.output.findUtxo(utxo, {}, height, Metaverse.transaction.ASSET_ISSUE_DEFAULT_FEE))
                            .then((result) => {
                                //Set change address to first utxo's address
                                if (change_address == undefined)
                                    change_address = result.utxo[0].address;
                                let certs = Metaverse.output.filter(utxo, { type: "asset-cert", symbol: [symbol,] })
                                    .concat(utxo.filter(output => {
                                        if (output.attachment.type == "asset-cert" && output.attachment.symbol == symbol.split('.')[0] && output.attachment.cert == 'domain')
                                            return true;
                                        else if (output.attachment.type == "asset-cert" && output.attachment.symbol == symbol && ['naming', 'issue'].indexOf(output.attachment.cert) !== -1)
                                            return true;
                                        return false;
                                    }))
                                return Metaverse.transaction_builder.issueAsset(result.utxo.concat(certs), issue_address, symbol, quantity, precision, issuer, description, secondaryissue_threshold, is_secondaryissue, change_address, result.change)
                            })
                            .then((tx) => wallet.sign(tx))
                    })
            })
            .catch((error) => {
                console.error(error)
                throw Error(error.message);
            })
    }


    validAddress = (address: string) => {
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
            .then((height: number) => this.setHeight(height))
            .then(() => this.getHeight())
    }

    getUtxo() {
        return this.getTxs()
            .then((txs: Array<any>) => txs.sort(function(a, b) {
                return b.height - a.height;
            }))
            .then((txs: Array<any>) => this.getAddresses()
                .then((addresses: Array<string>) => Metaverse.output.calculateUtxo(txs, addresses)));
    }

    getUtxoFrom(address: string) {
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

    listAvatars() {
        return this.getUtxo()
            .then((utxo) => {
                return utxo
            })
            .then((outputs) => this.blockchain.avatar.extract(outputs))
    }

    listCerts() {
        return this.getUtxo()
            .then((outputs) => Metaverse.output.filter(outputs, { type: "asset-cert" }))
    }

    getGlobalAvatar = (symbol) => this.blockchain.avatar.get(symbol)

    getBalances() {
        return this.storage.get('balances')
            .then((balances: any) => {
                let b = JSON.parse(JSON.stringify(this.DEFAULT_BALANCES));
                if (balances) {
                    if (balances.ETP)
                        b.ETP = balances.ETP;
                    if (balances.MST)
                        Object.keys(balances.MST).forEach((symbol) => {
                            b.MST[symbol] = balances.MST[symbol];
                        })
                    if (balances.MIT)
                        b.MIT = balances.MIT
                }
                return b;
            })
    }

    loadNewTxs(addresses: Array<string>, start: number) {
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
        return this.getHeight()
            .then(height => this.getAddresses()
                .then(addresses => this.getTxs()
                    .then(txs => Metaverse.output.calculateUtxo(txs, addresses))
                    .then(utxos => Promise.all([
                        this.blockchain.balance.all(utxos, addresses, height),
                        this.blockchain.balance.addresses(utxos, addresses, height)
                    ]))
                    .then((balances) => Promise.all([
                        this.setBalances(balances[0]),
                        this.setAddressBalances(balances[1])
                    ]))
                ))
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

    getNewTxs(addresses: Array<string>, lastKnownHeight: number, txs: any): Promise<any> {
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

    addAddresses(addresses: Array<string>) {
        return this.getAddresses()
            .then((addr: Array<string>) => this.storage.set('mvs_addresses', addr.concat(addresses)))
            .then(() => this.getAddresses())
            .then(() => this.event.publish('settings_update', {}))
    }

    setAddresses(addresses: Array<string>) {
        return this.storage.set('mvs_addresses', addresses)
            .then(() => this.getAddresses())
            .then(() => this.event.publish('settings_update', {}))
    }

    addTxs(newtxs: Array<any>) {
        return this.getTxs()
            .then((txs: any[]) => {
                if (newtxs.length)
                    newtxs.forEach((newtx) => {
                        let found = 0;
                        txs.forEach((oldtx, index) => {
                            if (newtx.hash == oldtx.hash) {
                                found = 1;
                                txs[index] = newtx;
                            }
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
                        let order: string[] = Object.keys(balances.MST)
                        return this.setAssetOrder(order);
                    })
                }
            })
    }

    setAssetOrder(orderList) {
        return this.storage.set('asset_order', orderList)
            .then(() => this.assetOrder())
    }

    addAssetToAssetOrder(name: string) {
        this.assetOrder()
            .then((_: string[]) => {
                if (_.indexOf(name) === -1)
                    _.push(name)
                return this.setAssetOrder(_)
            })
            .then(() => this.assetOrder())
    }

    send = (tx) => {
        return this.broadcast(tx.encode().toString('hex'))
            .then((result: any) => this.getHeight()
                .then(height => {
                    tx.height = height
                    tx.hash = result.hash
                    tx.outputs.forEach((output, index) => {
                        output.index = index;
                    })
                    tx.unconfirmed = true
                    return this.addTxs([tx])
                        .then(() => this.getData())
                        .then(() => tx)
                })
            )
    }

    broadcast(rawtx: string, max_fee: number = undefined) {
        return this.blockchain.transaction.broadcast(rawtx)
            .catch((error) => {
                if (error.message == 'ERR_CONNECTION')
                    throw Error(error.message)
                else
                    throw Error('ERR_BROADCAST')
            })
    }
}
