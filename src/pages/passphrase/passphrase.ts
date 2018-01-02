import { Component } from '@angular/core';
import { App, NavController, NavParams, Platform } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { AccountPage } from '../account/account';
import { AppGlobals } from '../../app/app.global';
import { TranslateService } from '@ngx-translate/core';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { CryptoServiceProvider } from '../../providers/crypto-service/crypto-service';

@Component({
    selector: 'page-passphrase',
    templateUrl: 'passphrase.html',
})
export class PassphrasePage {

    mnemonic: string;

    constructor(public nav: NavController,
        public navParams: NavParams,
        public globals: AppGlobals,
        private app: App,
        public translate: TranslateService,
        private crypto: CryptoServiceProvider,
        public platform: Platform,
        public mvs: MvsServiceProvider,
        public wallet: WalletServiceProvider) {
        this.mnemonic = this.navParams.get('mnemonic');
    }

    /* moves nagigation
     * encypts mnemonic with authentication provider encypt function
     * then writes the data to the json file and downloads the file
     */
    encrypt(password) {
        this.nav.push(LoginPage, {});
        this.crypto.encrypt(this.mnemonic, password)
            .then((res) => this.dataToKeystoreJson(res))
            .then((encrypted) => this.downloadFile('mvs_keystore.json', JSON.stringify(encrypted)))
            .catch((error) => {
                console.log(error)
            });
    }

    encryptMobile(password) {
        this.nav.push(AccountPage, {});
        let wallet = {};
        wallet = { "index": 10 }
        console.log('wallet set 10')
        this.wallet.setWallet(wallet)
            .then((wallet) => this.wallet.setSeedMobile(password, this.mnemonic))
            .then((seed) => this.wallet.setMobileWallet(seed))
            .then(() => Promise.all([this.wallet.getWallet(password), this.mvs.getAddressIndex()]))
            .then((results) => this.mvs.generateAddresses(results[0], 0, results[1]))
            .then((addresses) => this.mvs.addMvsAddresses(addresses))
            .then(() => this.app.getRootNav().setRoot(AccountPage))
            .catch((e) => {
                console.error(e);
            });
    }

    passwordValid = (password) => (password) ? password.length > 5 : false;

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
}
