import { Component } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobals } from '../../app/app.global';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage()
@Component({
    selector: 'page-advanced',
    templateUrl: 'advanced.html',
})
export class AdvancedPage {

    network: string
    isReadOnly: boolean

    constructor(
        public nav: NavController,
        public translate: TranslateService,
        private globals: AppGlobals,
        public platform: Platform,
        private wallet: WalletServiceProvider,
    ) {
        this.network = this.globals.network

        this.wallet.isReadOnly()
            .then((isReadOnly) => this.isReadOnly = isReadOnly)
    }

    ionViewDidEnter() {

    }

    MultisignaturePage = () => this.nav.push("MultisignaturePage")

    ExportMasterPublicKeyPage = e => this.nav.push("ExportXpubPage")

    DecodeTxPage = e => this.nav.push("DecodeTxPage")

    BurnPage = () => this.nav.push("BurnPage")

}
