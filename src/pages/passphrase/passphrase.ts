import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, LoadingController, Loading } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { AppGlobals } from '../../app/app.global';
import { TranslateService } from '@ngx-translate/core';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { CryptoServiceProvider } from '../../providers/crypto-service/crypto-service';
import { AlertProvider } from '../../providers/alert/alert';

import { DnaWalletProvider } from '../../providers/dna-wallet/dna-wallet';
import { DnaUtilRegexProvider } from "../../providers/dna-util-regex/dna-util-regex";
import {DnaReqReqProvider} from "../../providers/dna-req-req/dna-req-req";
import {DnaUtilUtilProvider} from "../../providers/dna-util-util/dna-util-util";

@IonicPage()
@Component({
    selector: 'page-passphrase',
    templateUrl: 'passphrase.html',
})
export class PassphrasePage {

    mnemonic: string = this.navParams.get('mnemonic')
    loading: Loading
    newWallet: boolean = this.navParams.get('newWallet') || false

    dnaKeyPair: any = null;
    dnaNoAccount: boolean = false;

    constructor(public nav: NavController,
        public navParams: NavParams,
        public globals: AppGlobals,
        public translate: TranslateService,
        private crypto: CryptoServiceProvider,
        public platform: Platform,
        public mvs: MvsServiceProvider,
        public loadingCtrl: LoadingController,
        public wallet: WalletServiceProvider,
        private alert: AlertProvider,
        private storage: Storage,
    ) {
        if (this.mnemonic) {
            DnaWalletProvider.generateWallet('bts', this.mnemonic).then((keyPair) => {
                this.dnaKeyPair = {
                    mnemonic: keyPair['mnemonic'],
                    privateKey: keyPair['privateKey'],
                    publicKey: keyPair['publicKey'],
                }
            }).catch((error) => {
                console.log(error);
            });
        }
    }

    downloadAndReturnLogin(username, password) {
        //this.nav.setRoot("LoginPage")
        //this.download(password)
        let that = this;

        that.alert.showLoading();
        that.usernameReg(username, (error) => {
            that.alert.stopLoading();
            if (error) {
                this.alert.showErrorWithoutSubTitle('PASSPHRASE.NOT_MATCH_USERNAME_EXISTS')
            } else {
                that.nav.setRoot('LoginPage');
                that.downloadWithDna(password);
            }
        });
    }

    downloadWithDna(password) {
        this.crypto.encrypt(this.mnemonic, password)
            .then((res) => this.dataToKeystoreJson(res))
            .then((encrypted) => {
                let dnaEncryptedText = DnaUtilUtilProvider.encryptKey(this.mnemonic, password)
                let dnaKeyFile       = DnaUtilUtilProvider.getKeyFile(dnaEncryptedText, 'bts');

                this.downloadFile('mvs_keystore.json', JSON.stringify({etp: encrypted, dna: dnaKeyFile}));
            })
            .catch((error) => {
                console.log(error)
            });
    }

    /* encypts mnemonic with authentication provider encypt function
     * then writes the data to the json file and downloads the file
     */
    download(password, username = '') {
        if (this.dnaNoAccount) {
            if (this.usernameValid(username)) {
                this.downloadAndReturnLogin(username, password);
            }
        } else {
            this.alert.showLoading()
            // 判断 DNA 公钥是否已注册
            DnaReqReqProvider.fetchBtsGetAccount(this.dnaKeyPair.publicKey).then((btsIds) => {
                this.alert.stopLoading();
                if (!btsIds['result'] || btsIds['result'].length <= 0 || !btsIds['result'][0] || btsIds['result'][0].length <= 0) {
                    this.dnaNoAccount = true;
                } else {
                    this.nav.setRoot('LoginPage');
                    this.downloadWithDna(password);
                }
            });
        }
    }

    encrypt(password, username = '', isMobile = false) {
        if (this.dnaNoAccount || (isMobile && username)) {
            if (this.usernameValid(username)) {
                this.alert.showLoading();
                this.usernameReg(username, (error) => {
                    if (error) {
                        this.alert.stopLoading();
                        this.alert.showErrorWithoutSubTitle('PASSPHRASE.NOT_MATCH_USERNAME_EXISTS')
                    } else {
                        this.storage.set('walletHasEtp', true)
                            .then(() => this.storage.set('walletHasEtp', true))
                            .then(() => this.storage.set('walletHasDna', true))
                            .then(() => this.storage.set('walletType', 'etp'))
                            .then(() => {
                                let dnaEncryptedText = DnaUtilUtilProvider.encryptKey(this.mnemonic, password)
                                let dnaKeyFile       = DnaUtilUtilProvider.getKeyFile(dnaEncryptedText, 'bts');

                                return this.storage.set('dnaUserInfo', {
                                    name: username,
                                    address: username,
                                    key: dnaKeyFile.key,
                                });
                            })
                            .then(() =>  this.wallet.setSeedMobile(password, this.mnemonic))
                            .then((seed) => this.wallet.setMobileWallet(seed))
                            .then(() => this.wallet.getWallet(password))
                            .then((wallet) => this.wallet.generateAddresses(wallet, 0, this.globals.index))
                            .then((addresses) => this.mvs.setAddresses(addresses))
                            .then(() => this.wallet.getMasterPublicKey(password))
                            .then((xpub) => this.wallet.setXpub(xpub))
                            .then(() => this.wallet.saveSessionAccount(password))

                            .then(() => this.nav.setRoot("LoadingPage", { reset: true }))
                            .catch((e) => {
                                console.error(e);
                                this.alert.stopLoading()
                            });
                    }
                });
            }
        } else {
            let btsId = '';

            this.alert.showLoading()
            DnaReqReqProvider.fetchBtsGetAccount(this.dnaKeyPair.publicKey)
                .then((btsIds) => {
                    if (!btsIds['result'] || btsIds['result'].length <= 0 || !btsIds['result'][0] || btsIds['result'][0].length <= 0) {
                        throw 'DNA.REG_ACCOUNT';
                    } else {
                        btsId = btsIds['result'][0][0];
                    }
                })
                .then(() => this.storage.set('walletHasEtp', true))
                .then(() => this.storage.set('walletHasDna', true))
                .then(() => this.storage.set('walletType', 'etp'))
                .then(() => DnaReqReqProvider.fetchBtsGetAccountDetail(btsId))
                .then((accounts) => {
                    if (accounts['result'] && accounts['result'].length > 0) {
                        return accounts['result'][0].name;
                    } else {
                        throw 'DNA.FETCH_ERROR';
                    }
                })
                .then((name) => {
                    let dnaEncryptedText = DnaUtilUtilProvider.encryptKey(this.mnemonic, password)
                    let dnaKeyFile       = DnaUtilUtilProvider.getKeyFile(dnaEncryptedText, 'bts');

                    return this.storage.set('dnaUserInfo', {
                        name: name,
                        address: name,
                        key: dnaKeyFile.key,
                    });
                })
                .then(() => this.wallet.setSeedMobile(password, this.mnemonic))
                .then((seed) => this.wallet.setMobileWallet(seed))
                .then(() => this.wallet.getWallet(password))
                .then((wallet) => this.wallet.generateAddresses(wallet, 0, this.globals.index))
                .then((addresses) => this.mvs.setAddresses(addresses))
                .then(() => this.wallet.getMasterPublicKey(password))
                .then((xpub) => this.wallet.setXpub(xpub))
                .then(() => this.wallet.saveSessionAccount(password))
                .then(() => this.nav.setRoot("LoadingPage", { reset: true }))
                .catch((e) => {
                    console.error(e);
                    this.alert.stopLoading()

                    if (e === 'DNA.REG_ACCOUNT') {
                        this.dnaNoAccount = true;
                    }
                });
        }
    }

    // 验证用户名格式是否正确
    usernameValid = (username) => {
        return username && DnaUtilRegexProvider.isBtsNameLegal(username);
    }

    // 验证用户名是否已存在
    usernameReg = (username, callback) => {
        DnaReqReqProvider.fetchBtsReg(username.toLowerCase(), this.dnaKeyPair.publicKey)
            .then((data) => {
                console.log(data)
                if (typeof callback === 'function') {
                    callback(data['error']);
                }
            });
    }

    // 验证密码格式是否正确
    passwordValid = (password) => {
        return password && DnaUtilRegexProvider.isPasswordLegal(password);
    }

    passwordRepeatValid = (password, password_repeat) => (password_repeat) ? password_repeat.length > 9 && password_repeat == password : false;

    completeNewWallet = (username, password, password_repeat) => (username && password && password_repeat) ? this.usernameValid(username) && this.complete(password, password_repeat) : false;

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
