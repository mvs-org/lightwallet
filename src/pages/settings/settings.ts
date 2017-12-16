import { Component } from '@angular/core';
import { NavController, AlertController, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { ExportWalletPage } from '../export-wallet/export-wallet';
import { TranslateService } from '@ngx-translate/core';
import { LoginPage } from '../login/login';


@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html',
})
export class SettingsPage {

    connectcode: any;

    constructor(public nav: NavController,  private mvs: MvsServiceProvider, private walletService: WalletServiceProvider, public translate: TranslateService, private alertCtrl: AlertController, public platform: Platform) {

      this.gencode();
      this.connectcode = "";

    }

    reset = () => this.mvs.dataReset();

    ExportWalletPage = e => this.nav.push(ExportWalletPage)

    gencode = () =>{
        this.walletService.getEncSeed()
        .then((content)=>{
        this.connectcode=content;
        });
    }


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
                                            this.nav.setRoot(LoginPage)
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
                                            this.nav.setRoot(LoginPage)
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
