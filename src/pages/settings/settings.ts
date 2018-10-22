import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, Platform } from 'ionic-angular';
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
    saved_accounts: any;

    constructor(
        public nav: NavController,
        private mvs: MvsServiceProvider,
        public translate: TranslateService,
        private alertCtrl: AlertController,
        private globals: AppGlobals,
        public platform: Platform,
        private alert: AlertProvider,
        private wallet: WalletServiceProvider
    ) {
        this.network = this.globals.network

        this.wallet.getSavedAccounts()
            .then((accounts) => this.saved_accounts = accounts ? Object.keys(accounts) : [])
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

    plugins = e => this.nav.push("PluginSettingsPage")

    /**
     * Logout dialog
     */
    logout() {
        this.translate.get('RESET_TITLE').subscribe(title => {
            this.translate.get('RESET_MESSAGE').subscribe(message => {
                this.translate.get('RESET_MESSAGE_MOBILE_SAVE_ACCOUNT').subscribe(messageMobile => {
                    this.translate.get('SAVE').subscribe(save => {
                        this.translate.get('DELETE').subscribe(no => {
                            this.translate.get('BACK').subscribe(back => {
                                let confirm = this.alertCtrl.create({
                                    title: title,
                                    message: message,
                                    buttons: [
                                        {
                                            text: save,
                                            handler: () => this.wallet.getAccountName()
                                                .then((current_username) => {
                                                    if(current_username) {
                                                        this.saveAccount(current_username);
                                                    } else {
                                                        this.newUsername('SAVE_ACCOUNT_TITLE', 'SAVE_ACCOUNT_MESSAGE', 'SAVE_ACCOUNT_PLACEHOLDER')
                                                    }
                                                })
                                        },
                                        {
                                            text: no,
                                            handler: () => {
                                                this.wallet.getAccountName()
                                                    .then((account_name) => this.wallet.deleteAccount(account_name))
                                                    .then(() => this.mvs.hardReset())
                                                    .then(() => this.nav.setRoot("LoginPage"))
                                            }
                                        },
                                        {
                                            text: back,
                                            handler: () => {
                                                console.log('Disagree clicked')
                                            }
                                        }
                                    ]
                                });
                                confirm.present()
                            })
                        })
                    })
                })
            })
        })
    }

    newUsername(title, message, placeholder) {
        this.askUsername(title, message, placeholder)
            .then((username) => {
                if(!username) {
                    this.newUsername('SAVE_ACCOUNT_TITLE_NO_INPUT', 'SAVE_ACCOUNT_MESSAGE', placeholder)
                } else if (this.saved_accounts.indexOf(username) != -1) {
                    console.log("account name already exist")
                    this.newUsername('SAVE_ACCOUNT_TITLE_ALREADY_EXIST', 'SAVE_ACCOUNT_MESSAGE_ALREADY_EXIST', placeholder)
                } else {
                    this.saveAccount(username);
                }
            })
    }

    askUsername(title, message, placeholder) {
        return new Promise((resolve, reject) => {
            this.translate.get([title, message, placeholder]).subscribe((translations: any) => {
                this.alert.askInfo(translations[title], translations[message], translations[placeholder], (info) => {
                    resolve(info)
                })
            })
        })
    }

    saveAccount(username) {
        this.wallet.saveAccount(username)
            .then(() => this.mvs.hardReset())
            .then(() => this.nav.setRoot("LoginPage"))
    }

}
