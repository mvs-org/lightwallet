import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { ImportWalletPage } from '../import-wallet/import-wallet';
import { ImportWalletMobilePage } from '../import-wallet-mobile/import-wallet-mobile';
import { AccountPage } from '../account/account';
import { LanguageSwitcherPage } from '../language-switcher/language-switcher';
import { GenerateKeyPage } from '../generate-key/generate-key';
import { ImportMnemonicPage } from '../import-mnemonic/import-mnemonic';
import { ThemeSwitcherPage } from '../theme-switcher/theme-switcher';
import { Storage } from '@ionic/storage';
import { AppGlobals } from '../../app/app.global';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})

export class LoginPage {

    fileToImport: string
    seed: string


    constructor(private nav: NavController, public platform: Platform, private storage: Storage, public globals: AppGlobals) {
        this.nav = nav;
        this.storage.get('seed')
            .then((seed)=>{
                this.storage.get('seed');
            })
    }



    GenerateKeyPage = e => this.nav.push(GenerateKeyPage)

    ImportMnemonicPage = e => this.nav.push(ImportMnemonicPage)

    switchLanguage = e => this.nav.push(LanguageSwitcherPage)

    switchTheme = e => this.nav.push(ThemeSwitcherPage)

    login = () => this.nav.push(ImportWalletPage)

    loginFromMobile = () => this.nav.push(ImportWalletMobilePage)

    account = () => this.nav.push(AccountPage)


}
