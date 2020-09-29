import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController, LoadingController, Loading } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AppGlobals } from '../../app/app.global';
import { TranslateService } from '@ngx-translate/core';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';


@IonicPage()
@Component({
    selector: 'page-login-account',
    templateUrl: 'login-account.html',
})
export class LoginAccountPage {

    mnemonic: string;
    loading: Loading;
    account: any

    constructor(public nav: NavController,
        public navParams: NavParams,
        private storage: Storage,
        public globals: AppGlobals,
        public translate: TranslateService,
        public platform: Platform,
        public mvs: MvsServiceProvider,
        public loadingCtrl: LoadingController,
        private alert: AlertProvider,
        private alertCtrl: AlertController,
        public wallet: WalletServiceProvider) {

            this.account = navParams.get('account')
    }

    cancel(e) {
        e.preventDefault()
        this.nav.pop()
    }

    importAccount(account, password) {
        this.alert.showLoading()
            // 初始化双链相关的标记
            .then(() => this.storage.set('walletHasEtp', true))
            .then(() => this.storage.set('walletHasDna', false))
            .then(() => this.storage.set('walletType', 'etp'))
            .then(() => this.storage.set('dnaUserInfo', null))
            .then(() => this.storage.get('saved_dna_accounts'))
            .then((savedDnaAccounts) => {
                if (savedDnaAccounts && savedDnaAccounts.length > 0) {
                    let index = -1;
                    savedDnaAccounts.find((o, i) => {
                        if (o.name === account.name) {
                            index = i;
                            return true;
                        }
                    });
                    if (index >= 0) {
                        return this.storage.set('walletHasDna', true)
                            .then(() => this.storage.set('dnaUserInfo', savedDnaAccounts[index].dnaUserInfo))
                            .then(() => this.storage.set('walletType', savedDnaAccounts[index].walletType));
                    }
                }
            })
            .then(() => this.wallet.decryptAccount(account.content, password))
            .then((decryptedAccount) => Promise.all([this.wallet.setupAccount(account.name, decryptedAccount), this.wallet.setAccountParams(account.params)]))
            .then(() => Promise.all([this.wallet.getWallet(password), this.wallet.getAddressIndexFromWallet()]))
            .then(([wallet, indexFromWallet]) => this.wallet.generateAddresses(wallet, 0, account.params.index || indexFromWallet))
            .then((addresses) => this.mvs.addAddresses(addresses))
            .then(() => this.wallet.getMasterPublicKey(password))
            .then((xpub) => this.wallet.setXpub(xpub))
            .then(() => this.wallet.saveSessionAccount(password))
            .then(() => this.alert.stopLoading())
            // 获取默认展示 ETP 还是 DNA，并跳转至相应的 Loading 页面
            .then(() => this.storage.get('walletType'))
            .then((walletType) => this.nav.setRoot(walletType === 'dna' ? "DnaLoadingPage" : "LoadingPage", { reset: true }))
            .catch((error) => {
                console.error(error.message)
                this.alert.stopLoading()
                switch(error.message){
                    case "ERR_DECRYPT_WALLET":
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        break;
                    case "ERR_ACCOUNT_NAME_UNKNOWN":
                        this.alert.showError('MESSAGE.ERR_ACCOUNT_NAME_UNKNOWN', '')
                        break;
                    default:
                        this.alert.showError('MESSAGE.ERR_IMPORT_ACCOUNT', error.message)
                        break;
                }
            })
    }

    deleteAccount(account_name) {
        this.translate.get('DELETE_ACCOUNT_TITLE').subscribe(title => {
            this.translate.get(this.platform.is('mobile') ? 'RESET_MESSAGE_MOBILE_SAVE_ACCOUNT' : 'DELETE_ACCOUNT_BODY').subscribe(message => {
                this.translate.get('DELETE').subscribe(no => {
                    this.translate.get('BACK').subscribe(back => {
                        let confirm = this.alertCtrl.create({
                            title: title,
                            message: message,
                            buttons: [
                                {
                                    text: back,
                                    handler: () => {
                                        console.log('Disagree clicked')
                                    }
                                },
                                {
                                    text: no,
                                    handler: () => {
                                        this.wallet.deleteAccount(account_name)
                                            // 删除 DNA 账户信息
                                            .then(() => this.storage.get('saved_dna_accounts'))
                                            .then((savedDnaAccounts) => {
                                                if (savedDnaAccounts && savedDnaAccounts.length > 0) {
                                                    savedDnaAccounts.find((o, i) => {
                                                        if (o.name === account_name) {
                                                            savedDnaAccounts.splice(i, 1);
                                                            return true;
                                                        }
                                                    });

                                                    return this.storage.set('saved_dna_accounts', savedDnaAccounts);
                                                }
                                            })
                                            .then(() => {this.nav.setRoot("LoginPage")})
                                    }
                                },

                            ]
                        });
                        confirm.present()
                    })
                })
            })
        })
    }

    passwordValid = (password) => (password) ? password.length > 3 : false;

    complete = (password) => (password) ? this.passwordValid(password) : false;

}
