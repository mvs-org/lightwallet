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
    ) {
    }

    errorImg = e => e.target.remove()

    gotoDeposit = (event) => this.nav.push("DepositPage")

    gotoTransactions = (event) => this.nav.push("transactions-page", { asset: 'ETP' })

    gotoTransfer = (event) => this.nav.push("transfer-page", { asset: 'ETP' })
}
