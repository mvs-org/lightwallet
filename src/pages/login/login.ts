import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ImportWalletPage } from '../import-wallet/import-wallet';
import { LanguageSwitcherPage } from '../language-switcher/language-switcher';
import { GenerateKeyPage } from '../generate-key/generate-key';
import { ImportMnemonicPage } from '../import-mnemonic/import-mnemonic';
import { ThemeSwitcherPage } from '../theme-switcher/theme-switcher';


@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})

export class LoginPage {

    constructor(private nav: NavController) {
        this.nav = nav;
    }

    GenerateKeyPage = e => this.nav.push(GenerateKeyPage)

    ImportMnemonicPage = e => this.nav.push(ImportMnemonicPage)

    switchLanguage = e => this.nav.push(LanguageSwitcherPage)

    switchTheme = e => this.nav.push(ThemeSwitcherPage)

    login = () => this.nav.push(ImportWalletPage)

}
