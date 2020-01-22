import { Component } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobals } from '../../app/app.global';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage()
@Component({
    selector: 'page-apps',
    templateUrl: 'apps.html',
})
export class AppsPage {

    network: string

    constructor(
        public nav: NavController,
        public translate: TranslateService,
        private globals: AppGlobals,
        public platform: Platform,
        private wallet: WalletServiceProvider,
    ) {
        this.network = this.globals.network
    }

    ionViewDidEnter() {

    }

    EtpBridgePage = () => this.nav.push("EtpBridgePage")

    PluginSettingsPage = e => this.nav.push("PluginSettingsPage")

    MovieTicketsPage = () => this.wallet.openLink("https://movies.mvsdna.com")


}
