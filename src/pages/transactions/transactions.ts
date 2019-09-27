import { Component } from '@angular/core';
import { AppGlobals } from '../../app/app.global';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage({
    name: 'transactions-page',
    segment: 'transactions/:asset'
})
@Component({
    selector: 'page-transactions',
    templateUrl: 'transactions.html'
})

export class TransactionsPage {

    asset: string
    txs: any[] = []
    loading: boolean

    display_segment: string = "transactions"
    height: number

    frozen_outputs_locked: any[] = []
    frozen_outputs_unlocked: any[] = []
    order_by: string = 'locked_until'
    direction: number = 0
    blocktime: number
    current_time: number
    icon: string = 'default_mst'
    page_tx: number = 1
    page_deposit_unlocked: number = 1
    items_per_page: number = 25
    txs_history: any[]
    transactionMap: Promise<any>
    assets: Array<string> = []

    addresses: Array<string> = this.navParams.get('addresses')
    allAddresses: Array<string> = []
    iconsList: Array<string> = []

    constructor(
        public navCtrl: NavController,
        private globals: AppGlobals,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        private wallet: WalletServiceProvider,
    ) {
        this.asset = navParams.get('asset');
        this.icon = navParams.get('icon');
        this.loading = true;
        this.current_time = Date.now()
        this.transactionMap = this.mvs.getTransactionMap()
        this.mvs.assetOrder().then(result => this.assets = ['ETP'].concat(result))
    }

    async ionViewDidEnter() {
        this.height = await this.mvs.getHeight()
        this.calculateFrozenOutputs()
        this.blocktime = await this.mvs.getBlocktime(this.height)
        this.allAddresses = await this.mvs.getAddresses()
        this.showTxs({ symbol: this.asset });
        this.iconsList = await this.wallet.getMstIcons()
    }

    depositProgress(start, end) {
        return Math.max(1, Math.min(99, Math.round((this.height - start) / (end - start) * 100)))
    }

    private async showTxs(filter) {
        let addresses = this.addresses ? this.addresses : this.allAddresses
        this.txs_history = await this.mvs.getTxs()
        this.txs = await this.filterTxs(this.txs_history, filter.symbol, addresses)
        this.loading = false
    }

    explorerURL = (tx) => (this.globals.network == 'mainnet') ? 'https://explorer.mvs.org/tx/' + tx : 'https://explorer-testnet.mvs.org/tx/' + tx

    async filterTxs(txs: any[], symbol, addresses) {
        let filteredTxs = []
        for (let i = 0; i < txs.length; i++) {
            let tx = await this.filterTx(txs[i], symbol, addresses, filteredTxs.length < this.items_per_page)
            if (tx) {
                filteredTxs.push(tx)
            }
        }
        return filteredTxs
    }

    async updateFilters(symbol, addresses) {
        this.icon = this.iconsList.indexOf(this.asset) !== -1 ? this.asset : 'default_mst'
        this.txs = await this.filterTxs(this.txs_history, symbol, addresses)
        if(this.addresses[0] == 'all') {
            this.addresses = this.allAddresses
        }
    }

    async filterTx(tx: any, asset: string, addresses: Array<string>, loadInputs: boolean = true) {
        let result = false
        let include_mst = false
        tx.inputs.forEach((input) => {
            if (!tx.unconfirmed) {
                if (['asset-transfer', 'asset-issue'].indexOf(input.attachment.type) !== -1) {
                    include_mst = true
                    result = false
                    if (input.attachment.symbol == asset && this.isMineTXIO(input, addresses)) {
                        result = true
                    }
                } else if (asset == 'ETP' && input.value && !include_mst && this.isMineTXIO(input, addresses)) {
                    result = true
                }
            }
        });
        if (result) {
            if (loadInputs) {
                tx = await this.mvs.organizeInputs(JSON.parse(JSON.stringify(tx)), false, await this.transactionMap)
                tx.inputsLoaded = true
            }
            return tx
        }
        tx.outputs.forEach((output) => {
            if (['asset-transfer', 'asset-issue'].indexOf(output.attachment.type) !== -1) {
                include_mst = true
                result = false
                if (output.attachment.symbol == asset && this.isMineTXIO(output, addresses)) {
                    result = true
                }
            } else if (asset == 'ETP' && output.value && !include_mst && this.isMineTXIO(output, addresses)) {
                result = true;
            }
        });
        if (result) {
            if (loadInputs) {
                tx = await this.mvs.organizeInputs(JSON.parse(JSON.stringify(tx)), false, await this.transactionMap)
                tx.inputsLoaded = true
            }
            return tx
        }
    }

    private isMineTXIO = (txio, addresses) => (addresses.indexOf(txio.address) !== -1)

    async calculateFrozenOutputs() {
        let outputs = await this.mvs.getFrozenOutputs(this.asset)
        this.frozen_outputs_locked = []
        this.frozen_outputs_unlocked = []
        let grouped_frozen_ouputs = {}
        outputs.forEach((output) => {
            grouped_frozen_ouputs[output.height] = grouped_frozen_ouputs[output.height] ? grouped_frozen_ouputs[output.height] : {}
            if (grouped_frozen_ouputs[output.height][output.locked_until]) {
                if (this.asset == 'ETP') {
                    grouped_frozen_ouputs[output.height][output.locked_until].value += output.value
                } else {
                    grouped_frozen_ouputs[output.height][output.locked_until].attachment.quantity += output.attachment.quantity
                }
                grouped_frozen_ouputs[output.height][output.locked_until].transactions.push(output.hash)
            } else {
                output.transactions = [output.hash]
                grouped_frozen_ouputs[output.height][output.locked_until] = output
            }
        })
        for (var height in grouped_frozen_ouputs) {
            var unlock = grouped_frozen_ouputs[height];
            for (var output in unlock) {
                if (this.height > parseInt(output))
                    this.frozen_outputs_unlocked.push(unlock[output])
                else
                    this.frozen_outputs_locked.push(unlock[output])
            }
        }
    }

    async pageChange(page_number) {
        this.loading = true
        this.page_tx = page_number
        for (let i = this.items_per_page * (page_number - 1); i < this.items_per_page * page_number; i++) {
            if (!this.txs[i].inputsLoaded) {
                this.txs[i] = await this.mvs.organizeInputs(JSON.parse(JSON.stringify(this.txs[i])), false, await this.transactionMap)
                this.txs[i].inputsLoaded = true
            }
        }
        this.loading = false
    }

}
