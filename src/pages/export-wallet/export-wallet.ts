import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage()
@Component({
    selector: 'page-export-wallet',
    templateUrl: 'export-wallet.html',
})
export class ExportWalletPage {

    connectcode: any = ''
    showQRCode: boolean = false
    hasSeed: boolean
    hasXpub: boolean

    constructor(
        public nav: NavController,
        private wallet: WalletServiceProvider,
    ) {
        this.wallet.getXpub()
            .then((xpub) => this.hasXpub = (xpub !== null && xpub !== undefined))

        this.wallet.hasSeed()
            .then((hasSeed) => this.hasSeed = hasSeed)
    }

    ionViewDidEnter() {
        console.log('Export wallet page loaded')
    }

    exportWallet = () => {
        this.wallet.exportWallet()
            .then((content) => {
                this.connectcode = content
                this.showQRCode = true
            });
    }

    exportViewOnlyWallet = () => {
        this.wallet.exportWalletViewOnly()
            .then((content) => {
                this.connectcode = content
                this.showQRCode = true
            });
    }

}
