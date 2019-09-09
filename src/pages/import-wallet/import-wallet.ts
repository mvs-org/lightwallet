import { Component } from '@angular/core';
import { IonicPage, NavController, Loading } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { TranslateService } from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@IonicPage()
@Component({
    selector: 'page-import-wallet',
    templateUrl: 'import-wallet.html',
})
export class ImportWalletPage {

    loading: Loading;
    data: Array<any>
    fileLoaded: boolean

    constructor(
        public nav: NavController,
        public mvs: MvsServiceProvider,
        private wallet: WalletServiceProvider,
        private translate: TranslateService,
        private alert: AlertProvider,
    ) {

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
                    this.alert.showError(message, '');
                });
            }
        };
        if(file[0])
            reader.readAsText(file[0]);
    }


    decrypt(password) {
        this.alert.showLoading()
        this.mvs.dataReset()
            .then(() => this.wallet.setSeed(password))
            .then(() => Promise.all([this.wallet.getWallet(password), this.wallet.getAddressIndex()]))
            .then((results) => this.wallet.generateAddresses(results[0], 0, results[1]))
            .then((addresses) => this.mvs.setAddresses(addresses))
            .then(() => this.wallet.saveSessionAccount(password))
            .then(() => this.nav.setRoot("LoadingPage", { reset: true }))
            .catch((e) => {
                console.error(e);
                this.alert.showError('MESSAGE.PASSWORD_WRONG', '');
                this.alert.stopLoading()
            });
    }

}
