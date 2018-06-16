import { Component } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';
import { AppGlobals } from '../../app/app.global';

@IonicPage()
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})

export class LoginPage {

    constructor (
        private nav: NavController,
        public platform: Platform,
        public globals: AppGlobals
    ){}

    GenerateKeyPage = e => this.nav.push("GenerateKeyPage")

    version = () => "v"+this.globals.version + " " + this.globals.name

    ImportMnemonicPage = e => this.nav.push("ImportMnemonicPage")

    switchLanguage = e => this.nav.push("LanguageSwitcherPage")

    switchTheme = e => this.nav.push("ThemeSwitcherPage")

    login = () => this.nav.push("ImportWalletPage")

    loginFromMobile = () => this.nav.push("ImportWalletMobilePage")

    howToMobile = () => this.nav.push("HowToMobilePage")

}
