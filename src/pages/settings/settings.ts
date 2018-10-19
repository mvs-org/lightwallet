import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobals } from '../../app/app.global';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage()
@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html',
})
export class SettingsPage {

    connectcode: any;
    network: string;

    constructor(
        public nav: NavController,
        private mvs: MvsServiceProvider,
        public translate: TranslateService,
        private alertCtrl: AlertController,
        private globals: AppGlobals,
        public platform: Platform,
        private wallet: WalletServiceProvider
    ) {
        this.network = this.globals.network
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
                this.translate.get('SAVE').subscribe(save => {
                    this.translate.get('DELETE').subscribe(no => {
                        this.translate.get('BACK').subscribe(back => {
                            let confirm = this.alertCtrl.create({
                                title: title,
                                message: message,
                                buttons: [
                                    {
                                        text: save,
                                        handler: () => {
                                            this.wallet.saveAccount().then(() => {
                                                this.mvs.hardReset().then(() => {
                                                    this.nav.setRoot("LoginPage")
                                                })
                                            })
                                        }
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
    }

    logoutMobile() {
        this.translate.get('RESET_TITLE').subscribe(title => {
            this.translate.get('RESET_MESSAGE_MOBILE_SAVE_ACCOUNT').subscribe(message => {
                this.translate.get('SAVE').subscribe(save => {
                    this.translate.get('DELETE').subscribe(no => {
                        this.translate.get('BACK').subscribe(back => {
                            let confirm = this.alertCtrl.create({
                                title: title,
                                message: message,
                                buttons: [
                                    {
                                        text: save,
                                        handler: () => {
                                            this.wallet.saveAccount().then(() => {
                                                this.mvs.hardReset().then(() => {
                                                    this.nav.setRoot("LoginPage")
                                                })
                                            })
                                        }
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
    }

}
