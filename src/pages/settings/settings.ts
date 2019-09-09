import { Component } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobals } from '../../app/app.global';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { AlertProvider } from '../../providers/alert/alert';

@IonicPage()
@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html',
})
export class SettingsPage {

    connectcode: any;
    network: string;
    saved_accounts_name: any = [];

    constructor(
        public nav: NavController,
        private mvs: MvsServiceProvider,
        public translate: TranslateService,
        private globals: AppGlobals,
        public platform: Platform,
        private alert: AlertProvider,
        private wallet: WalletServiceProvider
    ) {
        this.network = this.globals.network

        this.wallet.getSavedAccounts()
            .then((accounts) => this.saved_accounts_name = (accounts && accounts.length >= 1) ? accounts.map(account => account.name) : [])
    }

    ionViewDidEnter() {
        console.log('Settings page loaded')
        this.mvs.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.nav.setRoot("LoginPage")
            })
    }

    reset() {
        this.nav.setRoot("LoadingPage", { reset: true })
    }

    BaseCurrencyPage = () => this.nav.push("BaseCurrencyPage")

    ExportWalletPage = e => this.nav.push("ExportWalletPage")

    LanguageSwitcherPage = e => this.nav.push("LanguageSwitcherPage")

    ThemeSwitcherPage = e => this.nav.push("ThemeSwitcherPage")

    InformationPage = e => this.nav.push("InformationPage")

    /**
     * Logout dialog
     */
    logout() {
        this.wallet.getSessionAccountInfo()
            .then((account_info) => {
                if (account_info) {
                    this.alert.showLogout(this.saveAccountHandler, this.forgetAccountHandler)
                } else {
                    this.alert.showLogoutNoAccount(() => this.mvs.hardReset()
                        .then(() => this.nav.setRoot("LoginPage")))
                }
            })
    }

    newUsername(title, message, placeholder) {
        this.askUsername(title, message, placeholder)
            .then((username) => {
                if (!username) {
                    this.newUsername('SAVE_ACCOUNT_TITLE_NO_NAME', 'SAVE_ACCOUNT_MESSAGE', placeholder)
                } else if (this.saved_accounts_name.indexOf(username) != -1) {
                    this.newUsername('SAVE_ACCOUNT_TITLE_ALREADY_EXIST', 'SAVE_ACCOUNT_MESSAGE_ALREADY_EXIST', placeholder)
                } else {
                    this.saveAccount(username);
                }
            })
    }

    private forgetAccountHandler = () => {
        return this.wallet.getAccountName()
            .then((account_name) => this.wallet.deleteAccount(account_name))
            .then(() => this.mvs.hardReset())
            .then(() => this.nav.setRoot("LoginPage"))
    }

    private saveAccountHandler = () => {
        return this.wallet.getAccountName()
            .then((current_username) => {
                if (current_username) {
                    this.saveAccount(current_username);
                } else {
                    this.newUsername('SAVE_ACCOUNT_TITLE', 'SAVE_ACCOUNT_MESSAGE', 'SAVE_ACCOUNT_PLACEHOLDER')
                }
            })
    }

    askUsername(title, message, placeholder) {
        return new Promise((resolve, reject) => {
            this.translate.get([title, message, placeholder]).subscribe((translations: any) => {
                this.alert.askInfo(translations[title], translations[message], translations[placeholder], 'text', (info) => {
                    resolve(info)
                })
            })
        })
    }

    saveAccount(username) {
        this.wallet.saveAccount(username)
            .then(() => this.mvs.hardReset())
            .then(() => this.nav.setRoot("LoginPage"))
            .catch((error) => {
                this.alert.showError('MESSAGE.ERR_SAVE_ACCOUNT', error.message)
            })
    }

}
