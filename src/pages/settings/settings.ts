import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobals } from '../../app/app.global';

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
        public platform: Platform
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
                this.translate.get('CONFIRM').subscribe(yes => {
                    this.translate.get('BACK').subscribe(no => {
                        let confirm = this.alertCtrl.create({
                            title: title,
                            message: message,
                            buttons: [
                                {
                                    text: no,
                                    handler: () => {
                                        console.log('Disagree clicked')
                                    }
                                },
                                {
                                    text: yes,
                                    handler: () => {
                                        this.mvs.hardReset().then(() => {
                                            this.nav.setRoot("LoginPage")
                                        })
                                    }
                                }
                            ]
                        });
                        confirm.present()
                    })
                })
            })
        })
    }

    logoutMobile() {
        this.translate.get('RESET_TITLE').subscribe(title => {
            this.translate.get('RESET_MESSAGE_MOBILE').subscribe(message => {
                this.translate.get('CONFIRM').subscribe(yes => {
                    this.translate.get('BACK').subscribe(no => {
                        let confirm = this.alertCtrl.create({
                            title: title,
                            message: message,
                            buttons: [
                                {
                                    text: no,
                                    handler: () => {
                                        console.log('Disagree clicked')
                                    }
                                },
                                {
                                    text: yes,
                                    handler: () => {
                                        this.mvs.hardReset().then(() => {
                                            this.nav.setRoot("LoginPage")
                                        })
                                    }
                                }
                            ]
                        });
                        confirm.present()
                    })
                })
            })
        })
    }

}
