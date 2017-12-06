import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AccountPage } from '../account/account';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'page-import-wallet-mobile',
    templateUrl: 'import-wallet-mobile.html',

})
export class ImportWalletMobilePage {

    selectedFiles;
    loading: Loading;

    constructor(public nav: NavController, public navParams: NavParams, public mvs: MvsServiceProvider, private alertCtrl: AlertController, private loadingCtrl: LoadingController, private translate: TranslateService) {
    }

    open(e) {
        let file = e.target.files
        let reader = new FileReader();
        reader.onload = (e: any) => {
            let content = e.target.result;
            let data = {};
            try {
                data = JSON.parse(content)
                this.mvs.setWallet(data).then(()=>this.showPrompt(data))

            } catch (e) {
                console.error(e);
                this.translate.get('WRONG_FILE').subscribe((message: string) => {
                    this.showError(message);
                });
            }
        };
        reader.readAsText(file[0]);
    }


    decrypt(password) {
        this.translate.get('WRONG_PASSWORD').subscribe((message: string) => {
            this.mvs.setSeed(password)
                .then(()=>Promise.all([this.mvs.getWallet(password), this.mvs.getAddressIndex()]))
                .then((results) => this.generateAddresses(results[0], 0, results[1]))
                .then((addresses) => this.mvs.addMvsAddresses(addresses))
                .then(() => this.nav.setRoot(AccountPage))
                .then(() => this.nav.setRoot(AccountPage))
                .catch((e) => {
                    console.error(e);
                    this.showError(message);
                });
        });
    }

    private generateAddresses(wallet, from_index, to_index) {
        var addresses = [];
        for (let i = from_index; i < to_index; i++) {
            addresses.push(this.mvs.generateNewAddress(wallet, i));
        }
        return addresses;
    }


    // Uploads file but is init in constructor
    // Empty options to avoid having a target URL
    // uploader: FileUploader = new FileUploader({});
    // reader: FileReader = new FileReader();
    showPrompt(result) {
        this.translate.get('PASSWORD').subscribe((txt_password: string) => {
            this.translate.get('CANCEL').subscribe((txt_cancel: string) => {
                this.translate.get('ENTER_PASSWORD_HEADLINE').subscribe((txt_headline: string) => {
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
                                        this.decrypt(data.password)
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
