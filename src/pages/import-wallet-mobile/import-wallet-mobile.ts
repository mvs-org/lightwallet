import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AccountPage } from '../account/account';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@Component({
    selector: 'page-import-wallet-mobile',
    templateUrl: 'import-wallet-mobile.html',

})
export class ImportWalletMobilePage {

    selectedFiles;
    loading: Loading;

    constructor(public nav: NavController, public navParams: NavParams, public mvs: MvsServiceProvider, private alertCtrl: AlertController, private loadingCtrl: LoadingController, private translate: TranslateService, private barcodeScanner: BarcodeScanner) {
    }

    scan() {
        let wallet = {};
        wallet = {"index": 10}
        this.mvs.setWallet(wallet)
        this.barcodeScanner.scan({formats: 'QR_CODE'}).then((result) => {
            if(!result.cancelled) {
                var seed = result.text
                this.mvs.setMobileWallet(seed).then(()=>this.showPrompt(seed))
            }
        })
    }

    decrypt(password, seed) {
        this.translate.get('WRONG_PASSWORD').subscribe((message: string) => {
            this.mvs.setMobileWallet(seed)
                .then(()=>Promise.all([this.mvs.getWallet(password), this.mvs.getAddressIndex()]))
                .then((results) => this.mvs.generateAddresses(results[0], 0, results[1]))
                .then((addresses) => this.mvs.addMvsAddresses(addresses))
                .then(() => this.nav.setRoot(AccountPage))
                .catch((e) => {
                    console.error(e);
                    this.showError(message);
                });
        });
    }

    // Uploads file but is init in constructor
    // Empty options to avoid having a target URL
    // uploader: FileUploader = new FileUploader({});
    // reader: FileReader = new FileReader();
    showPrompt(seed) {
        this.translate.get('PASSWORD').subscribe((txt_password: string) => {
            this.translate.get('CANCEL').subscribe((txt_cancel: string) => {
                this.translate.get('ENTER_PASSWORD_HEADLINE_MOBILE').subscribe((txt_headline: string) => {
                    this.translate.get('ENTER').subscribe((txt_enter: string) => {

                        const alert = this.alertCtrl.create({
                            title: txt_headline,
                            inputs: [
                                {
                                    name: 'password',
                                    placeholder: '',
                                    type: 'password'
                                }
                            ],
                            buttons: [
                                {
                                    text: txt_cancel,
                                    role: 'cancel',
                                    handler: data => {
                                        this.nav.pop();
                                    }
                                },
                                {
                                    text: txt_enter,
                                    handler: data => {
                                        // need error handling
                                        this.decrypt(data.password, seed)
                                    }
                                }
                            ]
                        });
                        alert.present()

                    });
                });
            });
        });
    }

    showLoading() {
        this.translate.get('MESSAGE.LOADING').subscribe((loading: string) => {
            this.loading = this.loadingCtrl.create({
                content: loading,
                dismissOnPageChange: true
            });
            this.loading.present();
        })
    }

    showError(text) {
        if (this.loading) {
            this.loading.dismiss();
        }
        this.translate.get('MESSAGE.ERROR_TITLE').subscribe((title: string) => {
            let alert = this.alertCtrl.create({
                title: title,
                subTitle: text,
                buttons: [{
                    text: 'OK',
                    handler: (() => {
                        this.nav.pop();
                    })
                }]
            });
            alert.present(alert);
        })
    }
}
