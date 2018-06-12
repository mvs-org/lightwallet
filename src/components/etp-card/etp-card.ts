import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'etp-card',
    templateUrl: 'etp-card.html'
})
export class EtpCardComponent {

    @Input() balance: any;

    constructor(
        private nav: NavController
    ) { }

    gotoDeposit = () => this.nav.push("DepositPage")

    gotoTransactions = () => this.nav.push("transactions-page", { asset: 'ETP' })

    gotoTransfer = () => this.nav.push("transfer-page", { asset: 'ETP' })

    gotoReceive = () => this.nav.push("receive-page", { asset: 'ETP' })
}
