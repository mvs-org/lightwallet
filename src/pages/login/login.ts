import { Component } from '@angular/core';
import { IonicPage, NavController, Platform, Events } from 'ionic-angular';
import { AppGlobals } from '../../app/app.global';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})

export class LoginPage {

    public network = ''

    constructor(
        private nav: NavController,
        public platform: Platform,
        private storage: Storage,
        public globals: AppGlobals,
        private event: Events
    ) {
    }

    ionViewDidEnter() {
        this.loadNetwork()
    }

    GenerateKeyPage = e => this.nav.push("GenerateKeyPage")

    version = () => "v" + this.globals.version + " " + this.globals.name

    ImportMnemonicPage = e => this.nav.push("ImportMnemonicPage")

    switchLanguage = e => this.nav.push("LanguageSwitcherPage")

    switchNetwork = network => this.storage.set("network", this.network)
        .then(() => this.loadNetwork())

    loadNetwork = () => this.storage.get('network')
        .then(network => {
            this.globals.network = (network) ? network : this.globals.DEFAULT_NETWORK
            this.network = this.globals.network;
            this.event.publish('network_update', { network: this.network })
            return network;
        })

    switchTheme = e => this.nav.push("ThemeSwitcherPage")

    login = () => this.nav.push("ImportWalletPage")

    loginFromMobile = () => this.nav.push("ImportWalletMobilePage")

    howToMobile = () => this.nav.push("HowToMobilePage")

}
