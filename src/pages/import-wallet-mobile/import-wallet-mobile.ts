import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AppGlobals } from '../../app/app.global';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage()
@Component({
    selector: 'page-import-wallet-mobile',
    templateUrl: 'import-wallet-mobile.html',
})
export class ImportWalletMobilePage {

    selectedFiles;

    constructor(public nav: NavController, private globals: AppGlobals, public navParams: NavParams, private mvs: MvsServiceProvider, private wallet: WalletServiceProvider, private alertCtrl: AlertController, private translate: TranslateService, private barcodeScanner: BarcodeScanner) {
    }

    scan() {
        let wallet = {};
        this.barcodeScanner.scan({ formats: 'QR_CODE' }).then((result) => {
            if (!result.cancelled) {
                let content = result.text.toString().split('&')
                if (content.length != 3)
                    this.showError('IMPORT_FILE')
                else if (content[1] != this.globals.network.charAt(0))
                    this.showError('MESSAGE.NETWORK_MISMATCH')
                else
                    wallet = { "index": content[2] }
                    this.wallet.setWallet(wallet)
                    this.wallet.setMobileWallet(content[0]).then(() => this.showPrompt(content[0]))

            }
        })
    }

    decrypt(password, seed) {
        this.wallet.setMobileWallet(seed)
            .then(() => Promise.all([this.wallet.getWallet(password), this.wallet.getAddressIndex()]))
            .then((results) => this.mvs.generateAddresses(results[0], 0, results[1]))
            .then((addresses) => this.mvs.setMvsAddresses(addresses))
            .then(() => this.nav.setRoot("AccountPage"))
            .catch((e) => {
                console.error(e);
                this.showError('MESSAGE.PASSWORD_WRONG');
            });
    }

    howToMobile = () => this.nav.push("HowToMobilePage")

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

    showError(message_key, pop = false) {
        this.translate.get(['MESSAGE.ERROR_TITLE', message_key]).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['MESSAGE.ERROR_TITLE'],
                subTitle: translations[message_key],
                buttons: [{
                    text: 'OK',
                    handler: (() => {
                        if (pop)
                            this.nav.pop();
                    })
                }]
            });
            alert.present(alert);
        })
    }
}
