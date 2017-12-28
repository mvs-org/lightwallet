import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html',
})
export class SettingsPage {

    connectcode: any;

    constructor(public nav: NavController,  private mvs: MvsServiceProvider, public translate: TranslateService, private alertCtrl: AlertController, public platform: Platform) {

    }

    ionViewDidEnter() {
        console.log('Settings page loaded')
        this.mvs.getMvsAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.nav.setRoot("LoginPage")
            })
    }

    reset = () => this.mvs.dataReset();

    ExportWalletPage = e => this.nav.push("ExportWalletPage")

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
                                            confirm.dismiss()
                                            this.nav.setRoot("LoginPage")
                                            window.location.reload()
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
                                            confirm.dismiss()
                                            this.nav.setRoot("LoginPage")
                                            window.location.reload()
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
