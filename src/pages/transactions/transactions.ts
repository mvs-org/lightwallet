import { Component } from '@angular/core';
import { AppGlobals } from '../../app/app.global';
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
    txs: any[]
    loading: boolean

    display_segment: string = "transactions"
    height: number;

    frozen_outputs: any[] = [];

    constructor(
        public navCtrl: NavController,
        private globals: AppGlobals,
        public navParams: NavParams,
        private mvsServiceProvider: MvsServiceProvider
    ) {
        this.asset = navParams.get('asset');
        this.showTxs({ symbol: this.asset });
        this.loading = true;

    }

    ionViewDidEnter() {
        console.log('Transactions page loaded')
        this.mvsServiceProvider.getFrozenOutputs()
            .then(outputs=>{
                this.frozen_outputs=outputs;
            })
        this.mvsServiceProvider.getHeight()
            .then(height=>{
                this.height=height
            })
        this.mvsServiceProvider.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
            })
    }

    depositProgress(start_height, locked_until){
        return Math.max(1, Math.min(99, Math.round((this.height-start_height)/(locked_until-start_height)*100)))
    }

    private showTxs(filter) {
        return this.mvsServiceProvider.getAddresses()
            .then((addresses: string[]) => {
                return this.mvsServiceProvider.getTxs()
                    .then((txs: any[]) => this.filterTxs(txs, filter.symbol, addresses))
            })
            .then((txs: any) => {
                this.txs = txs
                this.loading = false;
            })
    }

    explorerURL = (tx) => (this.globals.network == 'mainnet') ? 'https://explorer.mvs.org/#!/tx/' + tx : 'https://explorer-testnet.mvs.org/#!/tx/' + tx;

    private filterTxs(txs: any[], symbol, addresses) {
        return Promise.all(txs.filter((tx) => this.filterTx(tx, symbol, addresses)))
    }


    private filterTx(tx: any, asset: string, addresses: Array<string>) {
        let result = false;
        tx.inputs.forEach((input) => {
            if (this.isMineTXIO(input, addresses)) {
                if (!tx.unconfirmed) {
                    if (['asset-transfer', 'asset-issue'].indexOf(input.attachment.type) !== -1 && input.attachment.symbol == asset)
                        result = true;
                    else if (asset == 'ETP' && input.value)
                        result = true;
                }
            }
        });
        if (result) return tx;
        tx.outputs.forEach((output) => {
            if (this.isMineTXIO(output, addresses)) {
                if (['asset-transfer', 'asset-issue'].indexOf(output.attachment.type) !== -1 && output.attachment.symbol == asset)
                    result = true;
                else if (asset == 'ETP' && output.value)
                    result = true;
            }
        });
        if (result) return tx;
    }

    public formatQuantity(quantity, decimals) {
        return quantity / Math.pow(10, decimals)
    }

    private isMineTXIO = (txio, addresses) => (addresses.indexOf(txio.address) !== -1)

    format(quantity, decimals) {
        return quantity / Math.pow(10, decimals);
    }

}
