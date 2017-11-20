import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Loading, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { PassphrasePage } from '../passphrase/passphrase';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@Component({
    selector: 'page-generate-key',
    templateUrl: 'generate-key.html',
})

export class GenerateKeyPage {
    loading: Loading;
    addresses: string[]
    data: any;
    wallet: any;
    builtFor: string;
    encrypted_json: object;

    constructor(private nav: NavController, public mvsServiceProvider: MvsServiceProvider, public navParams: NavParams, private alertCtrl: AlertController, private translate: TranslateService, private loadingCtrl: LoadingController) {
        this.CreateWallet()
        this.builtFor = 'browser';
    }

    // need to get hex
    CreateWallet() {
        this.showLoading()
        return this.mvsServiceProvider.createEtpWallet()
            .then((wallet) => {
                this.wallet = wallet;
                return this.ConfirmCreateWallet(this.wallet.mnemonic);
            });

    }


    showLoading() {
        this.translate.get('MESSAGE.LOADING').subscribe((loading: string) => {
            this.loading = this.loadingCtrl.create({
                content: loading,
                dismissOnPageChange: true
            });
            this.loading.present()
        })
    }


    showPopup(title, text) {
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: text,
        });
        alert.present();
    }

    // this is the newer version with (GenerateKeyPage)
    // is used in the new MetaverseJS call
    ConfirmCreateWallet(mnemonic) {
        this.translate.get('MESSAGE.ERROR_TITLE').subscribe((title: string) => {
            this.translate.get('MESSAGE.ERROR_CONNECT_BLOCKCHAIN').subscribe((text: string) => {
                this.loading.dismiss()
            }, error => {
                this.loading.dismiss()
                this.showPopup(title, error);
            });
        })
    }


    // this is when the user clicks the download button
    // if everything is okay calls the download function
    confirmWallet() {
        if (this.navParams.get('next') != undefined)
            this.navParams.get('next')()
        else
            this.download()
    }

    download() {
        this.translate.get("WARNING").subscribe(title => {
            this.translate.get('BACKUP_WORDS_BACKED_UP_TEXT').subscribe(text => {
                this.translate.get('BACKUP_WORDS_BACKED_UP_YES').subscribe(BACKUP_WORDS_BACKED_UP_YES => {
                    this.translate.get('NO').subscribe(NO => {
                        let alert = this.alertCtrl.create({
                            title: title,
                            subTitle: text,
                            buttons: [
                                {
                                    text: BACKUP_WORDS_BACKED_UP_YES,
                                    handler: data => {
                                        this.nav.push(PassphrasePage, this.wallet)
                                    }
                                }, {
                                    text: NO
                                }
                            ]
                        });
                        alert.present();
                    })
                })
            })
        })
    }

}
