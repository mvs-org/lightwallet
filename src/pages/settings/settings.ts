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
    saved_accounts_name: any;

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
            .then((accounts) => this.saved_accounts_name = accounts.map(account => account.name))
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
        this.mvs.dataReset()
            .then(() => this.nav.setRoot("AccountPage"))
    }

    base = () => this.nav.push("BaseCurrencyPage")

    ExportWalletPage = e => this.nav.push("ExportWalletPage")

    /**
     * Logout dialog
     */
     logout() {
         this.alert.showLogout(this.saveAccountHandler, this.forgetAccountHandler)
     }

     newUsername(title, message, placeholder1, placeholder2) {
         this.askUsername(title, message, placeholder1, placeholder2)
             .then((info) => {
                 let username = info.info1;
                 let password = info.info2;
                 if (!info || !info.info1) {
                     this.newUsername('SAVE_ACCOUNT_TITLE_NO_NAME', 'SAVE_ACCOUNT_MESSAGE', placeholder1, placeholder2)
                 } else if (this.saved_accounts_name.indexOf(username) != -1) {
                     this.newUsername('SAVE_ACCOUNT_TITLE_ALREADY_EXIST', 'SAVE_ACCOUNT_MESSAGE_ALREADY_EXIST', placeholder1, placeholder2)
                 } else if (!password) {
                     this.existingUsername(username, 'SAVE_ACCOUNT_TITLE_NO_PASSWORD', 'SAVE_ACCOUNT_MESSAGE_PASSWORD', 'PASSWORD')
                 } else {
                     this.saveAccount(username, password);
                 }
             })
     }

     existingUsername(username, title, message, placeholder) {
         this.askPassword(title, message, placeholder)
             .then((password) => {
                 if (!password) {
                     this.existingUsername(username, 'SAVE_ACCOUNT_TITLE_NO_PASSWORD', 'SAVE_ACCOUNT_MESSAGE_PASSWORD', placeholder)
                 } else {
                     this.saveAccount(username, password);
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
                     this.existingUsername(current_username, 'SAVE_ACCOUNT_TITLE_PASSWORD', 'SAVE_ACCOUNT_MESSAGE_PASSWORD', 'PASSWORD');
                 } else {
                     this.newUsername('SAVE_ACCOUNT_TITLE', 'SAVE_ACCOUNT_MESSAGE', 'SAVE_ACCOUNT_PLACEHOLDER', 'PASSWORD')
                 }
             })
     }

     askUsername(title, message, placeholder1, placeholder2) {
         return new Promise((resolve, reject) => {
             this.translate.get([title, message, placeholder1, placeholder2]).subscribe((translations: any) => {
                 this.alert.ask2Info(translations[title], translations[message], translations[placeholder1], translations[placeholder2], 'text', 'password', (info) => {
                     resolve(info)
                 })
             })
         })
     }

     askPassword(title, message, placeholder) {
         return new Promise((resolve, reject) => {
             this.translate.get([title, message, placeholder]).subscribe((translations: any) => {
                 this.alert.askInfo(translations[title], translations[message], translations[placeholder], 'password', (info) => {
                     resolve(info)
                 })
             })
         })
     }

     saveAccount(username, password) {
         this.wallet.getWallet(password)   //test password
             .then(() => this.wallet.saveAccount(username, password))
             .then(() => this.mvs.hardReset())
             .then(() => this.nav.setRoot("LoginPage"))
             .catch((error) => {
                 switch (error.message) {
                     case "ERR_DECRYPT_WALLET":
                         this.existingUsername(username, 'MESSAGE.PASSWORD_WRONG', 'SAVE_ACCOUNT_MESSAGE_PASSWORD', 'PASSWORD')
                         break;
                     default:
                         this.alert.showError('MESSAGE.ERR_SAVE_ACCOUNT', error.message)
                 }
             })
     }

}
