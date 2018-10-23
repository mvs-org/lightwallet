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
    account_name: string
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

            this.account_name = navParams.get('account')
    }

    importAccount(account_name, password) {
        this.alert.showLoading()
            .then(() => this.wallet.getSavedAccount(account_name))
            .then((account) => {
                this.account = account ? account : {}
                return { "index": account.index ? account.index : 10 }
            })
            .then((wallet) => this.wallet.setWallet(wallet))
            .then(() => Promise.all([this.wallet.setMobileWallet(this.account.seed), this.wallet.setAccountName(account_name), this.wallet.setMultisigAddresses(this.account.multisig_addresses), this.wallet.setMultisigInfo(this.account.multisigs), this.wallet.setPlugins(this.account.plugins)]))
            .then(() => Promise.all([this.wallet.getWallet(password), this.wallet.getAddressIndex()]))
            .then((results) => this.wallet.generateAddresses(results[0], 0, results[1]))
            .then((addresses) => this.mvs.addAddresses(addresses))
            .then(() => this.alert.stopLoading())
            .then(() => this.nav.setRoot("AccountPage"))
            .catch((error) => {
                console.error(error.message)
                this.alert.stopLoading()
                switch(error.message){
                    case "ERR_DECRYPT_WALLET":
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        break;
                    default:
                        this.alert.showError('MESSAGE.ERR_IMPORT_ACCOUNT', error.message)
                        break;
                }
            })
    }

    deleteAccount(account_name) {
        this.translate.get('DELETE_ACCOUNT_TITLE').subscribe(title => {
            this.translate.get('DELETE_ACCOUNT_BODY').subscribe(message => {
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
