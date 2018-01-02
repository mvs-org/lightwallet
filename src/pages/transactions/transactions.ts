import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@IonicPage({
    name: 'transactions-page',
    segment: 'transactions/:asset'
})
@Component({
    selector: 'page-transactions',
    templateUrl: 'transactions.html',
})

export class TransactionsPage {

    asset: any
    addresses: string[]
    txs: any[]

    constructor(public navCtrl: NavController, public navParams: NavParams, private mvsServiceProvider: MvsServiceProvider) {
        this.asset = navParams.get('asset');
        this.showTxs({ symbol: this.asset })
    }

    ionViewDidEnter() {
        console.log('Transactions page loaded')
        this.mvsServiceProvider.getMvsAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
            })
    }

    private orderTxs(txs) {
        // temporary array holds objects with position and sort-value
        var mapped = txs.map(function(el, i) {
            return { index: i, value: -el.timestamp };
        })

        // sorting the mapped array containing the reduced values
        mapped.sort(function(a, b) {
            return +(a.value > b.value) || +(a.value === b.value) - 1;
        });

        // container for the resulting order
        var result = mapped.map(function(el) {
            return txs[el.index];
        });
        return result
    }

    private showTxs(filter) {
        return this.mvsServiceProvider.getMvsAddresses()
            .then((addresses: string[]) => {
                this.addresses = addresses
                return this.mvsServiceProvider.getMvsTxs()
            })
            .then((txs) => this.txsMap(txs))
            .then((txs) => this.orderTxs(txs))
            .then((txs) => this.filterTxs(txs, filter))
            .then((txs: any) => {
                this.txs = txs
                return txs
            })
    }

    private filterTxs(txs: any[], filter: any) {
        return Promise.all(txs.filter((tx) => this.filterTx(tx, filter)))
    }

    private filterTx(tx: any, filter: any) {
        if (filter) {
            if (filter.symbol && filter.symbol === tx.asset.symbol) {
                return tx
            } else {
            }
        } else {
            return tx
        }
    }

    public txsMap(txs) {
        return Promise.all(txs.map((tx: any) => {
            return this.checkSide(tx).then((tx) => this.checkValue(tx));
        }))
    }

    public checkValue(tx) {
        var isMineTXIO = this.isMineTXIO
        var addresses = this.addresses
        return new Promise((resolve, reject) => {
            //Init tx asset
            tx.asset = {
                symbol: 'ETP',
                decimals: 8
            }
            return Promise.all(tx.outputs.map((output) =>
                isMineTXIO(output, addresses).then((txio: any) => {
                    //TODO: Check for asset transfer quantity
                    if (txio.asset.symbol !== 'ETP') {
                        tx.asset = txio.asset
                    }
                    if (tx.side === 'in') {
                        if (tx.quantity)
                            tx.quantity += output.quantity
                        else
                            tx.quantity = output.quantity
                    }
                }, (txio: any) => {
                    if (tx.side === 'out') {
                        if (txio.asset.symbol !== 'ETP') {
                            tx.asset = txio.asset
                        }
                        if (tx.quantity)
                            tx.quantity += output.quantity
                        else
                            tx.quantity = output.quantity
                    }
                }))).then(() => resolve(tx))
        })
    }

    public formatQuantity(quantity, decimals) {
        return quantity / Math.pow(10, decimals)
    }

    private isMineTXIO(txio, addresses) {
        return new Promise((resolve, reject) => {
            if (addresses.indexOf(txio.address) !== -1) {
                resolve(txio)
            }
            else {
                reject(txio)
            }
        })
    }

    public checkSide(tx) {
        return new Promise((resolve, reject) => {
            var addresses = this.addresses
            tx.inputs.forEach((txio) => {
                if (addresses.indexOf(txio.address) !== -1) {
                    tx.side = 'out'
                    resolve(tx)
                }
            })
            if (typeof tx.side === 'undefined') {
                tx.side = 'in'
                resolve(tx);
            }
        })
    }

    format(quantity, decimals) {
        return quantity / Math.pow(10, decimals);
    }

}

