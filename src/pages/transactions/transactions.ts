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
    txs: any[]
    loading: boolean

    constructor(public navCtrl: NavController, public navParams: NavParams, private mvsServiceProvider: MvsServiceProvider) {
        this.asset = navParams.get('asset');
        this.showTxs({ symbol: this.asset });
        this.loading = true;
    }

    ionViewDidEnter() {
        console.log('Transactions page loaded')
        this.mvsServiceProvider.getMvsAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
            })
    }

    private showTxs(filter) {
        return this.mvsServiceProvider.getMvsAddresses()
            .then((addresses: string[]) => {
                return this.mvsServiceProvider.getMvsTxs()
                    .then((txs: any[]) => this.filterTxs(txs,filter.symbol, addresses))
            })
            .then((txs: any) => {
                this.txs = txs
                this.loading = false;
            })
    }

    private filterTxs(txs: any[], symbol, addresses) {
        return Promise.all(txs.filter((tx) => this.filterTx(tx, symbol, addresses)))
    }


    private filterTx(tx: any, asset: string, addresses: Array<string>) {
        let result=false;
        tx.inputs.forEach((input)=>{
            if(this.isMineTXIO(input,addresses)){
            if(input.attachment.type=='asset-transfer'&&input.attachment.symbol==asset)
                result=true;
                else if(asset=='ETP' && input.value)
                    result=true;
                    }
        });
        if(result) return tx;
        tx.outputs.forEach((output)=>{
            if(this.isMineTXIO(output,addresses)){
            if(output.attachment.type=='asset-transfer'&&output.attachment.symbol==asset)
                result=true;
                else if(asset=='ETP' && output.value)
                    result=true;
                    }
        });
        if(result) return tx;
    }

    public formatQuantity(quantity, decimals) {
        return quantity / Math.pow(10, decimals)
    }

    private isMineTXIO = (txio, addresses)=>(addresses.indexOf(txio.address) !== -1)

    format(quantity, decimals) {
        return quantity / Math.pow(10, decimals);
    }

}
