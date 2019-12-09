import { Component, ViewChild } from '@angular/core';
import { AppGlobals } from '../../app/app.global';
import { IonicPage, NavController, NavParams, Select } from 'ionic-angular';
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
    selected: boolean = true
    allSelected: boolean = true

    @ViewChild('selectAddresses') selectAddresses: Select;

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

        const addresses = await this.mvs.getAddresses()
        const multisigAddresses = await this.wallet.getMultisigAddresses()
        this.allAddresses = addresses.concat(multisigAddresses)

        this.showTxs({ symbol: this.asset });
        this.iconsList = await this.wallet.getIcons().MST
    }

    depositProgress(start, end) {
        return Math.max(1, Math.min(99, Math.round((this.height - start) / (end - start) * 100)))
    }

    private async showTxs(filter) {
        this.addresses = this.addresses ? this.addresses : this.allAddresses
        this.txs_history = await this.mvs.getTxs()
        this.txs = await this.filterTxs(this.txs_history, filter.symbol, this.addresses)
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
    }

    async filterTx(tx: any, asset: string, addresses: Array<string>, loadInputs: boolean = true) {
        let result = false
        let include_mst = false
        if (tx.inputs) {
            for (let i = 0; i < tx.inputs.length; i++) {
                let input = tx.inputs[i]
                if (!tx.unconfirmed) {
                    if (['asset-transfer', 'asset-issue'].indexOf(input.attachment.type) !== -1) {
                        include_mst = true
                        result = false
                        if (input.attachment.symbol == asset && this.isMineTXIO(input, addresses)) {
                            result = true
                            break
                        }
                    } else if (asset == 'ETP' && input.value && !include_mst && this.isMineTXIO(input, addresses)) {
                        result = true
                        break
                    } else if (asset == 'ETP' && input.previous_output.hash == '0000000000000000000000000000000000000000000000000000000000000000' && this.isMineTXIO(input, addresses)) {
                        result = true
                        break
                    }
                }
            };
        }
        if (result) {
            if (loadInputs) {
                tx = await this.mvs.organizeInputs(JSON.parse(JSON.stringify(tx)), false, await this.transactionMap)
                tx.inputsLoaded = true
            }
            return tx
        }
        if (tx.outputs) {
            for (let i = 0; i < tx.outputs.length; i++) {
                let output = tx.outputs[i]
                if (['asset-transfer', 'asset-issue'].indexOf(output.attachment.type) !== -1) {
                    include_mst = true
                    result = false
                    if (output.attachment.symbol == asset && this.isMineTXIO(output, addresses)) {
                        result = true
                        break
                    }
                } else if (asset == 'ETP' && output.value && !include_mst && this.isMineTXIO(output, addresses)) {
                    result = true
                    break
                }
            };
        }
        if (result) {
            if (loadInputs) {
                tx = await this.mvs.organizeInputs(JSON.parse(JSON.stringify(tx)), false, await this.transactionMap)
                tx.inputsLoaded = true
            }
            return tx
        }
    }

    private isMineTXIO = (txio, addresses) => (addresses && addresses.indexOf(txio.address) !== -1)

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
        for (let i = this.items_per_page * (page_number - 1); i < this.txs.length; i++) {
            if (this.txs[i] && !this.txs[i].inputsLoaded) {
                this.txs[i] = await this.mvs.organizeInputs(JSON.parse(JSON.stringify(this.txs[i])), false, await this.transactionMap)
                this.txs[i].inputsLoaded = true
            }
        }
        this.loading = false
    }

    selectAll() {
        this.allSelected = true
        this.addresses = this.allAddresses
        this.selectAddresses.close().then(() => this.selectAddresses.open())
    }

    selectNone() {
        this.allSelected = false
        this.addresses = []
        this.txs = []
        this.selectAddresses.close().then(() => this.selectAddresses.open())
    }

    errorImg = e => this.icon = this.icon !== 'assets/icon/' + this.asset + '.png' ? 'assets/icon/' + this.asset + '.png' : 'assets/icon/default_mst.png'

}
