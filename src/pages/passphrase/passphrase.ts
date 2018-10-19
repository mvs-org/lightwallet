import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, LoadingController, Loading } from 'ionic-angular';

import { AppGlobals } from '../../app/app.global';
import { TranslateService } from '@ngx-translate/core';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { CryptoServiceProvider } from '../../providers/crypto-service/crypto-service';

@IonicPage()
@Component({
    selector: 'page-passphrase',
    templateUrl: 'passphrase.html',
})
export class PassphrasePage {

    mnemonic: string;
    loading: Loading;
    account_list: Array<string> = []

    constructor(public nav: NavController,
        public navParams: NavParams,
        public globals: AppGlobals,
        public translate: TranslateService,
        private crypto: CryptoServiceProvider,
        public platform: Platform,
        public mvs: MvsServiceProvider,
        public loadingCtrl: LoadingController,
        public wallet: WalletServiceProvider) {

            this.mnemonic = this.navParams.get('mnemonic');

            this.wallet.getSavedAccounts()
                .then((accounts) => this.account_list = accounts ? Object.keys(accounts) : [])
    }

    /* moves nagigation
     * encypts mnemonic with authentication provider encypt function
     * then writes the data to the json file and downloads the file
     */
    encrypt(account_name, password) {
        this.nav.setRoot("LoginPage");
        this.crypto.encrypt(this.mnemonic, password)
            .then((res) => this.dataToKeystoreJson(res))
            .then((encrypted) => this.downloadFile('mvs_keystore.json', JSON.stringify(encrypted)))
            .catch((error) => {
                console.log(error)
            });
    }

    encryptMobile(account_name, password) {
        this.showLoading();
        let wallet = {};
        wallet = { "index": 10 }
        console.log('wallet set 10')
        this.wallet.setWallet(wallet)
            .then((wallet) => this.wallet.setSeedMobile(password, this.mnemonic))
            .then((seed) => this.wallet.setMobileWallet(seed))
            .then(() => this.wallet.setAccountName(account_name))
            .then(() => Promise.all([this.wallet.getWallet(password), this.wallet.getAddressIndex()]))
            .then((results) => this.wallet.generateAddresses(results[0], 0, results[1]))
            .then((addresses) => this.mvs.addAddresses(addresses))
            .then(() => this.nav.setRoot("AccountPage"))
            .catch((e) => {
                console.error(e);
            });
    }

    passwordValid = (password) => (password) ? password.length > 5 : false;

    passwordRepeatValid = (password, password_repeat) => (password_repeat) ? password_repeat.length > 5 && password_repeat == password : false;

    complete = (password, password_repeat) => (password && password_repeat) ? this.passwordValid(password) && password == password_repeat : false;

    downloadFile(filename, text) {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);

        if (document.createEvent) {
            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            pom.dispatchEvent(event);
        }
        else {
            pom.click();
        }
    }

    dataToKeystoreJson(mnemonic) {
        let tmp = { version: this.globals.version, algo: this.globals.algo, index: this.globals.index, mnemonic: mnemonic };
        return tmp;
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

    validAccountName = (account_name) => account_name != undefined
        && account_name != ''
        && this.account_list.indexOf(account_name) == -1
}
