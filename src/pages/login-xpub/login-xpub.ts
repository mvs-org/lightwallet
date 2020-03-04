import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { AppGlobals } from '../../app/app.global';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';


@IonicPage()
@Component({
    selector: 'page-login-xpub',
    templateUrl: 'login-xpub.html',
})
export class LoginXpubPage {

    walletObj: any
    validXpub: boolean = false

    constructor(public nav: NavController,
        public globals: AppGlobals,
        public mvs: MvsServiceProvider,
        private alert: AlertProvider,
        public wallet: WalletServiceProvider) {

    }

    login(xpub) {
        this.alert.showLoading()
            .then(() => this.wallet.generateAddresses(this.walletObj, 0, this.globals.index))
            .then((addresses) => this.mvs.addAddresses(addresses))
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

    xpubValid = (xpub) => {
        if(!xpub || !xpub.startsWith("xpub")) {
            this.validXpub = false
            return
        }
        return this.wallet.getWalletFromMasterPublicKey(xpub)
            .then((wallet) => {
                this.walletObj = wallet
                this.validXpub = true
            })
            .catch((error) => {
                this.validXpub = false
            })
    }

}
