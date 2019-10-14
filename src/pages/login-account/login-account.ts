import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController, LoadingController, Loading } from 'ionic-angular';
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
            .then(() => this.wallet.decryptAccount(account.content, password))
            .then((decryptedAccount) => Promise.all([this.wallet.setupAccount(account.name, decryptedAccount), this.wallet.setAccountParams(account.params)]))
            .then(() => Promise.all([this.wallet.getWallet(password), this.wallet.getAddressIndex()]))
            .then(([wallet, index]) => this.wallet.generateAddresses(wallet, 0, index))
            .then((addresses) => this.mvs.addAddresses(addresses))
            .then(() => this.wallet.saveSessionAccount(password))
            .then(() => this.alert.stopLoading())
            .then(() => this.nav.setRoot("LoadingPage", { reset: true }))
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
                                        this.wallet.deleteAccount(account_name).then(() => {
                                            this.nav.setRoot("LoginPage")
                                        })
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
