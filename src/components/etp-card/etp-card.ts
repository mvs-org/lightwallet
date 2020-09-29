import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'etp-card',
    templateUrl: 'etp-card.html'
})
export class EtpCardComponent {

    @Input() balance: any;
    @Input() tickers: any;
    @Input() base: string;
    @Input() icon: string;

    constructor(
        private nav: NavController
    ) { }

    gotoTransactions = () => this.nav.push("transactions-page", { asset: 'ETP', icon: 'icon' })

    gotoTransfer = () => this.nav.push("transfer-page", { asset: 'ETP' })

    gotoReceive = () => this.nav.push("receive-page", { asset: 'ETP' })
}
