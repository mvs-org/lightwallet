import {Component, Input} from '@angular/core';
import {DnaUtilUtilProvider} from "../../providers/dna-util-util/dna-util-util";
import { NavController } from 'ionic-angular';

@Component({
    selector: 'dna-card',
    templateUrl: 'dna-card.html'
})
export class DnaCardComponent {

    @Input() userInfo: any;
    @Input() balance: any;
    @Input() icon: string;
    @Input() language: string;
    @Input() assetId: string;

    constructor(
        private nav: NavController
    ) { }

    formatTokenWithoutSymbol(val) {
        return DnaUtilUtilProvider.formatToken(val, [], 4, "");
    }

    gotoVote = () => {

    }

    gotoTransactions = () => {
        this.nav.push("dna-transactions-page", { asset: 'DNA', assetId: this.assetId, userInfo: this.userInfo })
    }

    gotoTransfer = () => {
        if (this.balance && this.balance.available > 0) {
            this.nav.push("dna-transfer-page", {asset: 'DNA', assetId: this.assetId, userInfo: this.userInfo, balance: this.balance})
        }
    }

    gotoReceive = () => {
        this.nav.push('dna-receive-page', {asset: 'DNA', assetId: this.assetId, userInfo: this.userInfo});
    }
}
