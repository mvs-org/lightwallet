import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { AppGlobals } from '../../app/app.global';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import * as Metaverse from 'metaversejs/dist/metaverse.js';
import * as CryptoJS from 'crypto-js';


@Injectable()
export class MvsServiceProvider {

    private headers = new Headers();
    private options

    DEFAULT_BALANCES = {
        "ETP": { total: 0, available: 0, decimals: 8, spent: 0 },
        "MVS.ZGC": { total: 0, available: 0, decimals: 8, spent: 0 },
        "MVS.ZDC": { total: 0, available: 0, decimals: 6, spent: 0 },
        "SDG": { total: 0, available: 0, decimals: 8, spent: 0 },
    }

    constructor(
        public http: Http,
        public globals: AppGlobals,
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

    getHDNodeFromMnemonic(mnemonic) {
        return Metaverse.wallet.fromMnemonic(mnemonic)
    }

    getHDNodeFromSeed(seed) {
        Metaverse.wallet.fromSeed(seed)
        return Metaverse.wallet.fromSeed(seed, Metaverse.networks[this.globals.network])
    }

    setWallet(wallet) {
        return this.storage.set('wallet', wallet)
    }

    setMobileWallet(seed) {
        return this.storage.set('seed', seed)
    }

    setSeed(passphrase){
    return this.getMnemonic(passphrase)
      .then((mnemonic)=>Metaverse.wallet.mnemonicToSeed(mnemonic, Metaverse.networks[this.globals.network]))
      .then((seed)=>this.encrypt(seed.toString('hex'),passphrase))
      .then((encseed)=>this.storage.set('seed',encseed))
    }

    setSeedMobile(passphrase, mnemonic){
    return Metaverse.wallet.mnemonicToSeed(mnemonic, Metaverse.networks[this.globals.network])
        .then((seed)=>this.encrypt(seed.toString('hex'),passphrase))
        .then((encseed)=> this.storage.set('seed',encseed))
    }

    getMnemonic(passphrase) {
    console.info('loading menmonic')
        return this.storage.get('wallet')
            .then((wallet) => this.decrypt(wallet.mnemonic, passphrase))
            .catch(() => {
                throw Error('ERR_DECRYPT_WALLET')
            })
    }

    getSeed(passphrase) {
    console.info('loading seed')
        return this.storage.get('seed')
            .then((seed) => this.decrypt(seed, passphrase))
            .catch((error) => {
                console.error(error)
                throw Error('ERR_DECRYPT_WALLET_FROM_SEED')
            })
    }

    getEncSeed() {
        return this.storage.get('seed')
    }

    getAddressIndex() {
        return this.storage.get('wallet')
            .then((wallet) => wallet.index)
    }

    decrypt(ec, pincode) {
        return new Promise(resolve => resolve(JSON.parse(CryptoJS.AES.decrypt(ec, pincode).toString(CryptoJS.enc.Utf8))))
    }

    encrypt(ec, pincode) {
        return new Promise(resolve => resolve(CryptoJS.AES.encrypt(JSON.stringify(ec), pincode).toString()))
    }

    createTx(passphrase, asset, recipient_address, quantity, from_address, change_address) {
        return this.updateInOuts()
            .then(()=>this.getUtxoFrom(from_address))
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
                return Promise.all([this.getWallet(passphrase), transaction, this.addTxInputs(transaction, transfer_info.outputs)]);
            })
            .then((results) => results[0].sign(results[1]))
            .catch((error) => {
                console.error(error)
                throw error.message;
            })
    }

    createDepositTx(passphrase, recipient_address, quantity, locktime, from_address, change_address) {
        return this.updateInOuts()
            .then(()=>this.getUtxoFrom(from_address))
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
                if((recipient_address==undefined||recipient_address=='auto')&&transfer_info.outputs.length)
                    recipient_address=transfer_info.outputs[0].address
                //Set recipient output
                transaction.addLockOutput(recipient_address, quantity, parseInt(locktime));
                //Add changes
                let changes = Object.keys(transfer_info.change);
                if (changes.length) {
                    changes.forEach((change_asset) => {
                        if (transfer_info.change[change_asset] != 0)
                            transaction.addOutput(change_address, change_asset, -transfer_info.change[change_asset])
                    })
                }
                return Promise.all([this.getWallet(passphrase), transaction, this.addTxInputs(transaction, transfer_info.outputs)]);
            })
            .then((results) => results[0].sign(results[1]))
            .catch((error) => {
                console.error(error)
                throw error.message;
            })
    }

    createIssueAssetTx(passphrase, symbol, issuer, max_supply, precision, description, issue_address, fee_address, change_address) {
        console.log(passphrase, symbol, issuer, max_supply, precision, description, issue_address, fee_address, change_address)
        return this.updateInOuts()
            .then(()=>this.getUtxoFrom(fee_address))
            .then((utxo) => {
                if (change_address == undefined) {
                    //Set change address to first utxo's address
                    change_address = utxo[0].address;
                }
                return Metaverse.transaction_builder.findUtxo(utxo, 'ETP', 0, 10*100000000)
            })
            .then((transfer_info: any) => {
                //Create new TX
                var transaction = new Metaverse.transaction();
                //Get recipient address
                if((issue_address==undefined||issue_address=='auto')&&transfer_info.outputs.length)
                    issue_address=transfer_info.outputs[0].address
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
                return Promise.all([this.getWallet(passphrase), transaction, this.addTxInputs(transaction, transfer_info.outputs)]);
            })
            .then((results) => results[0].sign(results[1]))
            .catch((error) => {
                console.error(error)
                throw error.message;
            })
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


    getWallet(passphrase) {
        return this.getSeed(passphrase)
            .then((seed:string) => this.getHDNodeFromSeed(Buffer.from(seed,'hex')))
            .catch((error)=>{
                console.error(error)
                return this.getMnemonic(passphrase)
                    .then((mnemonic) => this.getHDNodeFromMnemonic(mnemonic))
                })
    }


    fetchMvsHeight() {
        return new Promise((resolve, reject) => {
            this._get(this.globals.host + '/height', {}).then(resolve, _ => reject(_))
        })
    }

    updateMvsHeight() {
        return new Promise((resolve, reject) => {
            this.fetchMvsHeight()
                .then((height) => {
                    return this.setMvsHeight(height)
                })
                .then(() => this.getMvsHeight())
                .then(resolve)
                .catch(reject)
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
                let b = this.DEFAULT_BALANCES;
                if (balances && Object.keys(balances).length)
                    Object.keys(balances).forEach((asset) => {
                        b[asset] = balances[asset];
                    })
                return b;
            })
    }

    getMvsInOuts(addresses) {
        return this._get(this.globals.host + '/inouts', { addresses: addresses })
    }

    getNewMvsTxs(addresses, start) {
        return this._get(this.globals.host + '/txs', { addresses: addresses, start: start })
    }

    getAddressBalances() {
        return this.storage.get('addressbalances')
    }

    setAddressBalances(balances) {
        return this.storage.set('addressbalances', balances)
    }

    setBalances(newBalances) {
        if (Object.keys(newBalances).length == 0)
            newBalances = this.DEFAULT_BALANCES
        return this.getBalances()
            .then((balances) => {
                //Check if balance has been changed
                let nb = JSON.parse(JSON.stringify(this.DEFAULT_BALANCES));
                Object.keys(newBalances).forEach((asset)=>{
                    nb[asset]=newBalances[asset];
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
            this.getUpdateTime().then((date: Date) => {
                var now = new Date()
                resolve(typeof date === 'undefined' || (+now - +date) / 1000 > UPDATE_INTERVAL)
            }, reject)
        })
    }

    calculateMvsBalances() {
        var balances = {}
        var addressbalances = {}
        return Promise.all([this.getMvsTxs(), this.getMvsHeight()])
            .then((results: any) => Promise.all(results[0].map(tx => this.addTxToBalance(tx, balances, addressbalances, results[1]))))
            .then(() => this.setBalances(balances))
            .then(() => this.setAddressBalances(addressbalances))
    }

    setUpdateTime() {
        return this.storage.set('last_update', new Date())
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

    addTxToBalance(tx, balances, addressbalances, height) {
        return this.getMvsAddresses()
            .then((addresses) => {
                return Promise.all([Promise.all((tx.inputs || []).map((input) => {
                    if (this.inArray(addresses || [], input.address)) {
                        //Initialize if needed
                        if (typeof balances[input.asset.symbol] === 'undefined')
                            balances[input.asset.symbol] = { total: 0, available: 0, spent: 0, decimals: input.asset.decimals };
                        balances[input.asset.symbol].spent += input.quantity;
                        balances[input.asset.symbol].available -= input.quantity
                        //Sum inputs for addresses
                        if (typeof addressbalances[input.address] === 'undefined')
                            addressbalances[input.address] = {};
                        if (typeof addressbalances[input.address][input.asset.symbol] === 'undefined')
                            addressbalances[input.address][input.asset.symbol] = { total: 0, available: 0, decimals: input.asset.decimals, spent: 0 };
                        addressbalances[input.address][input.asset.symbol].spent += input.quantity;
                        addressbalances[input.address][input.asset.symbol].available -= input.quantity;
                    }
                    return input;
                })), Promise.all((tx.outputs || []).map((output) => {
                    if (this.inArray(addresses || [], output.address)) {
                        //Initialize if needed
                        if (typeof balances[output.asset.symbol] === 'undefined')
                            balances[output.asset.symbol] = { total: 0, available: 0, spent: 0, decimals: output.asset.decimals };
                        balances[output.asset.symbol].total += output.quantity;

                        //Sum outputs for addresses
                        if (typeof addressbalances[output.address] === 'undefined')
                            addressbalances[output.address] = {};
                        if (typeof addressbalances[output.address][output.asset.symbol] === 'undefined')
                            addressbalances[output.address][output.asset.symbol] = { total: 0, available: 0, decimals: output.asset.decimals, spent: 0 }
                        addressbalances[output.address][output.asset.symbol].total += output.quantity;

                        //Sum available quantities
                        if (output.lock_height + tx.height <= height) {
                            balances[output.asset.symbol].available += output.quantity
                            addressbalances[output.address][output.asset.symbol].available += output.quantity
                        }
                    }
                    return output;
                }))])
            }).then(() => {
                return balances;
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
                        this.storage.clear();
                        return Promise.all([this.storage.set('language', language), this.storage.set('theme', theme)]);
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
                    txs = txs.concat(newTxs.txs)
                    if (newTxs.txs.length < 100) {
                        this.addMvsTxs(txs).then(() => {
                            resolve(txs)
                        })
                    }
                    else {
                        let height = newTxs.txs[newTxs.txs.length - 1].height
                        resolve(this.getNewTxs(addresses, height, txs))
                    }
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
            .then(() => this.getMvsAddresses() )
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

    broadcast(rawtx, max_fee=undefined) {
        return new Promise((resolve, reject) => {
            this._post(this.globals.host + '/broadcast', { "tx": rawtx }).then(resolve, _ => reject(_))
        })
    }

    private _post(url, data) {
        return new Promise((resolve, reject) => {
            this.http.post(url, data, this.options)
                .subscribe(_ => resolve(_.json().result), _ => reject(_))
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
                .subscribe(_ => {
                    resolve(_.json().result)
                })
        });
    }
}
