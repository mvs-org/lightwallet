import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'mst-card',
    templateUrl: 'mst-card.html'
})
export class MSTCardComponent {

    @Input() balance: any;
    @Input() symbol: string;
    @Input() theme: string;
    @Input() icon: string;
    @Input() swap: boolean;

    constructor(
        private nav: NavController
    ) {}

    errorImg = e => e.target.remove()

    gotoTransactions = () => this.nav.push("transactions-page", { asset: this.symbol })

    gotoTransfer = () => this.nav.push("transfer-page", { asset: this.symbol })

    gotoReceive = () => this.nav.push("receive-page", { asset: this.symbol })

    gotoSwap = () => this.nav.push("eth-swap-page", { asset: this.symbol })
}
