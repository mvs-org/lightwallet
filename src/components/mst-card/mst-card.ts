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
    @Input() tickers: any;
    @Input() base: string;

    constructor(
        private nav: NavController
    ) { }

    errorImg = e => this.icon = this.icon !== 'assets/icon/' + this.symbol + '.png' ? 'assets/icon/' + this.symbol + '.png' : 'assets/icon/default_mst.png'

    gotoTransactions = () => this.nav.push("transactions-page", { asset: this.symbol, icon: this.icon })

    gotoTransfer = () => this.nav.push("transfer-page", { asset: this.symbol })

    gotoReceive = () => this.nav.push("receive-page", { asset: this.symbol })

    gotoSwap = () => this.nav.push("eth-swap-page", { asset: this.symbol })

    gotoVote = () => this.nav.push("vote-page", { })
}
