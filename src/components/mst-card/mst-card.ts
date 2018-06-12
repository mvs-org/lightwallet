import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'mst-card',
    templateUrl: 'mst-card.html'
})
export class MSTCardComponent {

    @Input() balance: any;
    @Input() symbol: string;

    constructor(
        private nav: NavController
    ) {
    }

    errorImg = e => e.target.remove()

    gotoTransactions = (event, symbol) => this.nav.push("transactions-page", { asset: symbol })

    gotoTransfer = (event, symbol) => this.nav.push("transfer-page", { asset: symbol })

    gotoReceive = (even, asset) => this.nav.push("receive-page", { asset: asset })
}
