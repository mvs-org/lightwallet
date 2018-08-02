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

    frozen_outputs_locked: any[] = [];
    frozen_outputs_unlocked: any[] = [];
    order_by: string = 'locked_until'
    direction: number = 0
    blocktime: number
    current_time: number

    constructor(
        public navCtrl: NavController,
        private globals: AppGlobals,
        public navParams: NavParams,
        private mvs: MvsServiceProvider
    ) {
        this.asset = navParams.get('asset');
        this.showTxs({ symbol: this.asset });
        this.loading = true;
        this.current_time = Date.now()

    }

    ionViewDidEnter() {
        console.log('Transactions page loaded')
        this.mvs.getHeight()
            .then(height=>{
                this.height=height
            })
            .then(() => this.mvs.getFrozenOutputs())
            .then(outputs=>{
                this.frozen_outputs_locked = []
                this.frozen_outputs_unlocked = []
                let grouped_frozen_ouputs = {}
                outputs.forEach((output) => {
                    grouped_frozen_ouputs[output.height] = grouped_frozen_ouputs[output.height] ? grouped_frozen_ouputs[output.height] : {}
                    if(grouped_frozen_ouputs[output.height][output.locked_until]) {
                        grouped_frozen_ouputs[output.height][output.locked_until].value += output.value
                        grouped_frozen_ouputs[output.height][output.locked_until].transactions.push(output.hash)
                    } else {
                        output.transactions = [output.hash]
                        grouped_frozen_ouputs[output.height][output.locked_until] = output
                    }
                })
                for (var height in grouped_frozen_ouputs) {
                    var unlock = grouped_frozen_ouputs[height];
                    for (var output in unlock) {
                        if(this.height>parseInt(output))
                            this.frozen_outputs_unlocked.push(unlock[output])
                        else
                            this.frozen_outputs_locked.push(unlock[output])
                    }
                }
            })
            .then(() => this.mvs.getBlocktime(this.height))
            .then(blocktime => this.blocktime = blocktime)

        this.mvs.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
            })
    }

    depositProgress(start_height, locked_until){
        return Math.max(1, Math.min(99, Math.round((this.height-start_height)/(locked_until-start_height)*100)))
    }

    private showTxs(filter) {
        return this.mvs.getAddresses()
            .then((addresses: string[]) => {
                return this.mvs.getTxs()
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
