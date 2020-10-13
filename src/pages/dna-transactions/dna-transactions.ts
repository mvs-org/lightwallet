import { Component } from '@angular/core';
//import { AppGlobals } from '../../app/app.global';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {DnaReqWsSubscribeProvider} from "../../providers/dna-req-ws-subscribe/dna-req-ws-subscribe";

let DATA = require('../../data/data').default;

@IonicPage({
    name: 'dna-transactions-page',
    segment: 'dna-transactions/:asset'
})
@Component({
    selector: 'page-dna-transactions',
    templateUrl: 'dna-transactions.html'
})

export class DnaTransactionsPage {

    display_segment: string = "transactions"

    asset: string;
    assetId: string;
    assetPrecision: number;
    userInfo: any;
    loading: boolean;

    icons: any;

    height: number

    items_per_page: number = 20;
    page_tx: number;
    txs: any;
    fzs: any;
    users: any = {};

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
    ) {
        this.icons          = DATA.icons;
        this.asset          = navParams.get('asset');
        this.assetId        = navParams.get('assetId');
        this.assetPrecision = navParams.get('assetPrecision');
        this.userInfo       = navParams.get('userInfo');
        this.loading        = true;
    }

    async ionViewDidEnter() {
        this.loadHistories();
    }

    loadHistories() {
        this.fzs = [];
        DnaReqWsSubscribeProvider.wsGetAccountHistoryOperations(this.userInfo.name).then((histories) => {
            this.loading = false;

            let txs  = [];
            let uids = [];
            let blks = [];
            if (histories && histories.length > 0) {
                for (let i = 0; i < histories.length; i ++) {
                    if (histories[i] && histories[i].op && histories[i].op.length > 0 && histories[i].op[1] && histories[i].op[1].amount) {
                        if (histories[i].op[1].amount.asset_id === this.assetId) {
                            txs.push(histories[i]);

                            if (uids.indexOf(histories[i].op[1].from) <= -1) {
                                uids.push(histories[i].op[1].from);
                            }
                            if (uids.indexOf(histories[i].op[1].to) <= -1) {
                                uids.push(histories[i].op[1].to);
                            }
                            if (blks.indexOf(histories[i].block_num) <= -1) {
                                blks.push(histories[i].block_num);
                            }
                        }
                    }
                }
            }
            this.txs = txs;

            if (uids.length > 0) {
                DnaReqWsSubscribeProvider.wsFetchBtsGetAccountsDetail(uids).then((accounts) => {
                    if (accounts && accounts.length > 0) {
                        for (let i = 0; i < accounts.length; i ++) {
                            this.users[accounts[i].id] = accounts[i].name;
                        }
                    }
                });
            }
        });
    }

    depositProgress(start, end) {
        return Math.max(1, Math.min(99, Math.round((this.height - start) / (end - start) * 100)))
    }

    pageChange = (page_number) => {
        this.page_tx = page_number;
    }

    showHideDetails = () => {

    }
}
