import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage()
@Component({
    selector: 'page-report',
    templateUrl: 'report.html',
})
export class ReportPage {

    constructor(
        private wallet: WalletServiceProvider,
    ) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ReportPage');
    }

    report = () => this.wallet.openLink("https://docs.google.com/forms/d/e/1FAIpQLSeMI5N7f6W86k-oT5m1PSQ9e1CLrpgDDPzg2mdezAO33IDQ9Q/viewform?usp=sf_link");

    github = () => this.wallet.openLink("https://github.com/mvs-org/lightwallet/issues");

}
