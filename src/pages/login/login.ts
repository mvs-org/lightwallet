import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Events } from 'ionic-angular';
import { AppGlobals } from '../../app/app.global';
import { Storage } from '@ionic/storage';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})

export class LoginPage {

    public network = ''
    saved_accounts: Array<any> = []
    isApp: boolean

    constructor(
        private nav: NavController,
        public platform: Platform,
        private storage: Storage,
        public globals: AppGlobals,
        private event: Events,
        private wallet: WalletServiceProvider,
        private navParams: NavParams,
        private translate: TranslateService,
    ) {
        this.isApp = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'));

        this.wallet.getSavedAccounts()
            .then((accounts) => this.saved_accounts = accounts ? accounts : [])
    }

    ionViewDidEnter() {
        this.loadNetwork()
    }

    getLogoClasses(){
        return{
            banner: true,
            china: this.translate.currentLang=='zh'
        }
    }

    GenerateKeyPage = e => this.nav.push("GenerateKeyPage")

    version = () => "v" + this.globals.version + " " + this.globals.name

    ImportMnemonicPage = e => this.nav.push("ImportMnemonicPage")

    switchLanguage = e => this.nav.push("LanguageSwitcherPage")

    switchNetwork = network => this.storage.set("network", this.network)
        .then(() => this.loadNetwork())

    loadNetwork = () => this.storage.get('network')
        .then(network => {
            this.globals.network = this.navParams.get('network') ? this.navParams.get('network') : network ? network : this.globals.DEFAULT_NETWORK
            this.network = this.globals.network;
            this.event.publish('network_update', { network: this.network })
            return network;
    });

    switchTheme = e => this.nav.push("ThemeSwitcherPage")

    login = () => this.nav.push("ImportWalletPage")

    loginFromMobile = () => this.nav.push("ImportWalletMobilePage")

    howToMobile = () => this.nav.push("HowToMobilePage")

    LoginAccountPage = (account) => this.nav.push("LoginAccountPage", { account: account })

}
