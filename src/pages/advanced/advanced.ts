import { Component } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
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
    hasSeed: boolean

    loaded: boolean = false
    walletType: string;

    constructor(
        public nav: NavController,
        public translate: TranslateService,
        private globals: AppGlobals,
        public platform: Platform,
        private wallet: WalletServiceProvider,
        private storage: Storage,
    ) {
        this.network = this.globals.network

        this.wallet.hasSeed()
            .then((hasSeed) => this.hasSeed = hasSeed)

        // 获取当前显示的钱包是 ETP 还是 DNA
        this.storage.get('walletType').then((walletType) => {
            this.walletType = walletType === 'dna' ? 'dna' : 'etp';
            this.storage.get('walletHasDna').then((walletHasDna) => {
                this.loaded = true;
                if (!walletHasDna) {
                    this.walletType = 'etp';
                }
            });
        });
    }

    ionViewDidEnter() {

    }

    MultisignaturePage = () => this.nav.push("MultisignaturePage")

    ExportMasterPublicKeyPage = e => this.nav.push("ExportXpubPage")

    DecodeTxPage = e => this.nav.push("DecodeTxPage")

    BurnPage = () => this.nav.push("BurnPage")

}
