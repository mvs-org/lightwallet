import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, LoadingController, Loading } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
    selector: 'page-import-wallet',
    templateUrl: 'import-wallet.html',
})
export class ImportWalletPage {

    loading: Loading;
    data: Array<any>
    fileLoaded: boolean

    constructor(public nav: NavController, public mvs: MvsServiceProvider, private wallet: WalletServiceProvider, private alertCtrl: AlertController, private loadingCtrl: LoadingController, private translate: TranslateService) {
        this.fileLoaded = false;

    }

    open(e) {
        let file = e.target.files
        let reader = new FileReader();
        reader.onload = (e: any) => {
            let content = e.target.result;

            try {
                this.data = JSON.parse(content)
                this.wallet.setWallet(this.data).then(() => this.fileLoaded = true)

            } catch (e) {
                console.error(e);
                this.translate.get('WRONG_FILE').subscribe((message: string) => {
                    this.showError(message);
                });
            }
        };
        if(file[0])
            reader.readAsText(file[0]);
    }


    decrypt(password) {
        this.showLoading()
        this.mvs.dataReset()
            .then(() => this.wallet.setSeed(password))
            .then(() => Promise.all([this.wallet.getWallet(password), this.wallet.getAddressIndex()]))
            .then((results) => this.wallet.generateAddresses(results[0], 0, results[1]))
            .then((addresses) => this.mvs.setAddresses(addresses))
            .then(() => this.nav.setRoot("AccountPage", { reset: true }))
            .catch((e) => {
                console.error(e);
                this.showError('MESSAGE.PASSWORD_WRONG');
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

    showError(message_key, pop = false) {
        if (this.loading) {
            this.loading.dismiss();
        }
        this.translate.get(['MESSAGE.ERROR_TITLE', message_key]).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['MESSAGE.ERROR_TITLE'],
                message: translations[message_key],
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
