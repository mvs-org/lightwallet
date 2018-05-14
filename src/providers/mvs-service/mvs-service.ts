import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { AppGlobals } from '../../app/app.global';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { WalletServiceProvider } from '../wallet-service/wallet-service';
import * as Metaverse from 'metaversejs/dist/metaverse.js';
import * as Blockchain from 'mvs-blockchain/dist/index.js';


@Injectable()
export class MvsServiceProvider {

    private headers = new Headers();
    private options
    private blockchain = Blockchain();

    DEFAULT_BALANCES = {
        "ETP": { total: 0, available: 0, decimals: 8, spent: 0 },
        "MVS.ZGC": { total: 0, available: 0, decimals: 8, spent: 0 },
        "MVS.ZDC": { total: 0, available: 0, decimals: 6, spent: 0 },
        "CSD.CSD": { total: 0, available: 0, decimals: 8, spent: 0 },
        "PARCELX.GPX": { total: 0, available: 0, decimals: 8, spent: 0 },
        "SDG": { total: 0, available: 0, decimals: 8, spent: 0 },
    }

    constructor(
        public http: Http,
        public globals: AppGlobals,
        private wallet: WalletServiceProvider,
        private event: Events,
        private storage: Storage
    ) {
        this.headers = new Headers();
        this.headers.append("Accept", 'application/json');
        this.headers.append('Content-Type', 'application/json');
        this.options = new RequestOptions({ headers: this.headers });
    }

    createEtpWallet() {
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

    createTx(passphrase, asset, recipient_address, quantity, from_address, change_address) {
        return this.updateInOuts()
            .then(() => this.getUtxoFrom(from_address))
            .then((utxo) => {
                if (change_address == undefined) {
                    //Set change address to first utxo's address
                    change_address = utxo[0].address;
                }
                return Metaverse.transaction_builder.findUtxo(utxo, asset, quantity)
            })
            .then((transfer_info: any) => {
                //Create new TX
                var transaction = new Metaverse.transaction();
                //Set recipient output
                transaction.addOutput(recipient_address, asset, quantity);
                //Add changes
                let changes = Object.keys(transfer_info.change);
                if (changes.length) {
                    changes.forEach((change_asset) => {
                        if (transfer_info.change[change_asset] != 0)
                            transaction.addOutput(change_address, change_asset, -transfer_info.change[change_asset])
                    })
                }
                return Promise.all([this.wallet.getWallet(passphrase), transaction, this.addTxInputs(transaction, transfer_info.outputs)]);
            })
            .then((results) => results[0].sign(results[1]))
            .catch((error) => {
                console.error(error)
                throw Error(error.message);
            })
    }

    createDepositTx(passphrase, recipient_address, quantity, locktime, from_address, change_address) {
        return this.updateInOuts()
            .then(() => this.getUtxoFrom(from_address))
            .then((utxo) => {
                if (change_address == undefined) {
                    //Set change address to first utxo's address
                    change_address = utxo[0].address;
                }
                return Metaverse.transaction_builder.findUtxo(utxo, 'ETP', quantity)
            })
            .then((transfer_info: any) => {
                //Create new TX
                var transaction = new Metaverse.transaction();
                //Get recipient address
                if ((recipient_address == undefined || recipient_address == 'auto') && transfer_info.outputs.length)
                    recipient_address = transfer_info.outputs[0].address
                //Set recipient output
                transaction.addLockOutput(recipient_address, quantity, parseInt(locktime), Metaverse.networks[this.globals.network]);
                //Add changes
                let changes = Object.keys(transfer_info.change);
                if (changes.length) {
                    changes.forEach((change_asset) => {
                        if (transfer_info.change[change_asset] != 0)
                            transaction.addOutput(change_address, change_asset, -transfer_info.change[change_asset])
                    })
                }
                return Promise.all([this.wallet.getWallet(passphrase), transaction, this.addTxInputs(transaction, transfer_info.outputs)]);
            })
            .then((results) => results[0].sign(results[1]))
            .catch((error) => {
                console.error(error)
                throw Error(error.message);
            })
    }

    createIssueAssetTx(passphrase, symbol, issuer, max_supply, precision, description, issue_address, fee_address, change_address) {
        return this.updateInOuts()
            .then(() => this.getUtxoFrom(fee_address))
            .then((utxo) => {
                if (change_address == undefined) {
                    //Set change address to first utxo's address
                    change_address = utxo[0].address;
                }
                return Metaverse.transaction_builder.findUtxo(utxo, 'ETP', 0, 10 * 100000000)
            })
            .then((transfer_info: any) => {
                //Create new TX
                var transaction = new Metaverse.transaction();
                //Get recipient address
                if ((issue_address == undefined || issue_address == 'auto') && transfer_info.outputs.length)
                    issue_address = transfer_info.outputs[0].address
                //Set recipient output
                transaction.addAssetIssueOutput(symbol, parseInt(max_supply), parseInt(precision), issuer, issue_address, description);
                //Add changes
                let changes = Object.keys(transfer_info.change);
                console.log(transfer_info)
                if (changes.length) {
                    changes.forEach((change_asset) => {
                        if (transfer_info.change[change_asset] != 0)
                            transaction.addOutput(change_address, change_asset, -transfer_info.change[change_asset])
                    })
                }
                console.log(transaction)
                return Promise.all([this.wallet.getWallet(passphrase), transaction, this.addTxInputs(transaction, transfer_info.outputs)]);
            })
            .then((results) => results[0].sign(results[1]))
            .catch((error) => {
                console.error(error)
                throw Error(error.message);
            })
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

    private addTxInputs(transaction, inputs) {
        return Promise.all(inputs.map((output: any) => {
            return this.findAddress(output.hash, output.index).then((address) => {
                return transaction.addInput(address, output.hash, output.index, output.script);
            })
        }))
    }

    findAddress(txHash, outputIndex) {
        return new Promise((resolve, reject) => {
            let found = 0;
            this.getMvsTxs()
                .then((txs: Array<any>) => {
                    txs.forEach((tx) => {
                        if (tx.hash == txHash) {
                            found = 1
                            resolve(tx.outputs[outputIndex].address)
                        }
                    })
                    if (!found) throw "Address not found"
                })
        })
    }

    updateMvsHeight() {
        return new Promise((resolve, reject) => {
            this.blockchain.height()
                .then((height) => {
                    return this.setMvsHeight(height)
                })
                .then(() => this.getMvsHeight())
                .then(_ => resolve((_)))
                .catch(() => reject())
        })
    }

    getUtxo() {
        return new Promise((resolve, reject) => {
            this.storage.get('utxo')
                .then(_ => resolve((_) ? _ : []))
        })
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

    setUtxo(utxo: any) {
        return this.storage.set('utxo', utxo);
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

    getMvsInOuts(addresses) {
        return this._get(this.globals.host[this.globals.network] + '/inouts', { addresses: addresses })
    }

    getNewMvsTxs(addresses, start) {
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

    filterUtxo = function(outputs, inputs, transactions, current_height) {
        return new Promise((resolve, reject) => {
            let ins = JSON.parse(JSON.stringify(inputs));
            var utxo = [];
            if (outputs.length) {
                outputs.forEach((output, oindex) => {
                    if (this.outputIsUnspent(output, ins)) {
                        let spendable_from_address = this.outputIsSpendableFromAddress(output, transactions, current_height)
                        if (spendable_from_address && output.value > 0) {
                            output.address = spendable_from_address
                            utxo.push(output)
                        }
                    }
                });
            }
            resolve(utxo);
        });
    };

    outputIsSpendableFromAddress(output, transactions, current_height) {
        var spendable_from = 0;
        transactions.forEach((tx) => {
            if (!spendable_from && tx.id == output.tx_id && tx.height + tx.outputs[output.index].lock_height < current_height) {
                spendable_from = tx.outputs[output.index].address;
            }
        })
        return spendable_from;
    }

    outputIsUnspent(output, ins) {
        var unspent = 1;
        if (ins.length)
            ins.forEach((input, index) => {
                if (unspent && input.belong_tx_id == output.tx_id && input.output_index == output.index) {
                    unspent = 0;
                }
            });
        return unspent;
    }

    updateInOuts() {
        return this.getMvsAddresses()
            .then((addresses) => Promise.all([this.getMvsInOuts(addresses), this.getMvsTxs(), this.getMvsHeight()]))
            .then((results) => this.filterUtxo(results[0][1], results[0][0], results[1], results[2]))
            .then((utxo) => {
                return this.setUtxo(utxo)
            })
    }


    getData(): Promise<any> {
        var balances: {};
        return this.getBalances()
            .then(_ => {
                balances = _;
                return Promise.all([this.getMvsAddresses(), this.getLastMvsTxXHeight(), this.getMvsHeight(), this.getMvsTxs()])
            })
            .then(results => { return this.getNewTxs(results[0], results[1], results[3]) })
            .then(() => this.calculateMvsBalances())
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

    calculateMvsBalances() {
        return Promise.all([this.getMvsTxs(), this.getMvsHeight(), this.getMvsAddresses()])
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

    setMvsHeight(height) {
        return this.storage.set('mvs_height', height)
    }

    getMvsHeight() {
        return new Promise((resolve, reject) => {
            this.storage.get('mvs_height').then((height) => resolve((height) ? height : 0))
        })
    }

    setLoaded(bool) {
        return this.storage.set('loaded', bool)
    }

    getLoaded() {
        return new Promise((resolve, reject) => {
            this.storage.get('loaded').then((loaded) => resolve((loaded) ? loaded : false))
        })
    }

    getLastMvsTxXHeight() {
        return new Promise((resolve, reject) => {
            this.storage.get('mvs_last_tx_height').then((height) => resolve((height) ? height : 0))
        })
    }

    setLastMvsTxHeight(height) {
        return this.storage.set('mvs_last_tx_height', height);
    }

    getMvsAddresses() {
        return this.storage.get('mvs_addresses')
            .then((addresses) => (addresses) ? addresses : [])
    }

    inArray(haystack, needle) {
        return haystack.indexOf(needle) !== -1;
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
        return new Promise((resolve, reject) => {
            if (typeof txs == 'undefined')
                txs = []
            this.getNewMvsTxs(addresses, lastKnownHeight)
                .then((newTxs: any) => {
                    txs = txs.concat(newTxs.transactions)
                    this.addMvsTxs(txs).then(() => {
                        resolve(txs)
                    })
                })
        })
    }

    getMvsTxs() {
        return new Promise((resolve, reject) => {
            this.storage.get('mvs_txs')
                .then((txs) => resolve((txs) ? txs : []))
        })
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

    addMvsAddresses(addresses) {
        return this.getMvsAddresses()
            .then((addr: any[]) => this.storage.set('mvs_addresses', addr.concat(addresses)))
            .then(() => this.getMvsAddresses())
            .then(() => this.event.publish('settings_update', {}))
    }

    setMvsAddresses(addresses) {
        return this.storage.set('mvs_addresses', addresses)
            .then(() => this.getMvsAddresses())
            .then(() => this.event.publish('settings_update', {}))
    }

    addMvsTxs(newtxs) {
        return this.getMvsTxs()
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
                    this.setLastMvsTxHeight(newtxs[newtxs.length - 1].height)
                return this.getMvsTxs()
            })
    }


    assetOrder() {
        return new Promise((resolve, reject) => {
            this.storage.get('asset_order').then((_: string[]) => {
                if (_)
                    resolve(_)
                else {
                    this.getBalances().then((balances: any) => {
                        let order: string[] = Object.keys(balances)
                        this.setAssetOrder(order).then((order) => resolve(order))
                    })
                }
            })
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

    orderAssets(fromIndex: number, toIndex: number): Promise<any> {
        return this.assetOrder()
            .then((_: string[]) => {
                _.splice(toIndex, 0, _.splice(fromIndex, 1)[0]);
                return this.setAssetOrder(_)
            })
            .then(() => this.assetOrder())
    }

    broadcast(rawtx, max_fee = undefined) {
        return this._post(this.globals.host[this.globals.network] + '/broadcast', { "tx": rawtx, "max_fee": max_fee })
            .catch((error) => {
                if (error.message == 'ERR_CONNECTION')
                    throw Error(error.message)
                else
                    throw Error('ERR_BROADCAST')
            })
    }

    private _post(url, data) {
        return new Promise((resolve, reject) => {
            this.http.post(url, data, this.options)
                .subscribe(_ => resolve(_.json().result), _ => {
                    try {
                        let message = _.json().code
                        console.error(message)
                        reject(Error(message))
                    } catch (error) {
                        console.log(error)
                        reject(Error('ERR_CONNECTION'))
                    }
                })
        });
    }

    private _get(url, data) {
        return new Promise((resolve, reject) => {
            let options = new RequestOptions({
                search: new URLSearchParams(),
            });
            if (data)
                Object.keys(data).forEach(key => {
                    if (Array.isArray(data[key])) {
                        data[key].forEach((element) => {
                            options.search.append(key, element)
                        })
                    } else {
                        options.search.set(key, String(data[key]))
                    }
                });
            this.http.get(url, options)
                .subscribe(_ => resolve(_.json().result), _ => {
                    try {
                        let message = _.json().code
                        console.error(message)
                        reject(Error(message))
                    } catch (error) {
                        console.log(error)
                        reject(Error('ERR_CONNECTION'))
                    }
                })
        });
    }
}
