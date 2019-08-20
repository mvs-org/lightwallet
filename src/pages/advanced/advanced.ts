import { Component } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobals } from '../../app/app.global';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { AlertProvider } from '../../providers/alert/alert';

@IonicPage()
@Component({
    selector: 'page-advanced',
    templateUrl: 'advanced.html',
})
export class AdvancedPage {

    connectcode: any;
    network: string;
    saved_accounts_name: any = [];

    constructor(
        public nav: NavController,
        public translate: TranslateService,
        private globals: AppGlobals,
        public platform: Platform,
    ) {
        this.network = this.globals.network
    }

    ionViewDidEnter() {

    }

    MultisignaturePage = () => this.nav.push("MultisignaturePage")

    PluginSettingsPage = e => this.nav.push("PluginSettingsPage")

    DecodeTxPage = e => this.nav.push("DecodeTxPage")

    EthBridgePage = e => this.nav.push("EthBridgePage")

    InformationPage = e => this.nav.push("InformationPage")

}
