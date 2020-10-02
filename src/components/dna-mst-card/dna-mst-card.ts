import { Component, Input } from '@angular/core';
import { DnaUtilUtilProvider } from "../../providers/dna-util-util/dna-util-util";
import { NavController } from 'ionic-angular';

@Component({
    selector: 'dna-mst-card',
    templateUrl: 'dna-mst-card.html'
})
export class DnaMstCardComponent {

    @Input() userInfo: any;
    @Input() balance: any;
    @Input() asset: any;
    @Input() icon: string;
    @Input() language: string;

    constructor(
        private nav: NavController
    ) {  }

    formatTokenWithoutSymbol(val) {
        return DnaUtilUtilProvider.formatToken(val, [], this.asset.precision, "");
    }

    gotoTransactions = () => {
        this.nav.push("dna-transactions-page", { asset: this.asset.symbol, assetId: this.asset.id, userInfo: this.userInfo })
    }

    gotoTransfer = () => {
        this.nav.push("dna-transfer-page", { asset: this.asset.symbol, assetId: this.asset.id, userInfo: this.userInfo, balance: this.balance })
    }

    gotoReceive = () => {
        this.nav.push('dna-receive-page', { asset: this.asset.symbol, assetId: this.asset.id, userInfo: this.userInfo });
    }
}
