import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { AppGlobals } from '../../app/app.global';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';
import {DnaUtilRegexProvider} from '../../providers/dna-util-regex/dna-util-regex';
import {DnaReqWsSubscribeProvider} from '../../providers/dna-req-ws-subscribe/dna-req-ws-subscribe';
import {DnaUtilUtilProvider} from '../../providers/dna-util-util/dna-util-util';


@IonicPage()
@Component({
    selector: 'page-login-xpub',
    templateUrl: 'login-xpub.html',
})
export class LoginXpubPage {

    addresses: Array<string>
    validXpub: boolean = false
    validUsername: boolean = false;

    constructor(public nav: NavController,
        public globals: AppGlobals,
        public mvs: MvsServiceProvider,
        private alert: AlertProvider,
        public wallet: WalletServiceProvider,
        public storage: Storage,
    ) {

    }

    login(xpub, username) {
        this.alert.showLoading()
            .then(() => this.storage.set('walletHasEtp', true))
            .then(() => this.storage.set('walletHasEtp', true))
            .then(() => this.storage.set('walletHasDna', true))
            .then(() => this.storage.set('walletType', 'etp'))
            .then(() => {
                return this.storage.set('dnaUserInfo', {
                    name: username,
                    address: username,
                });
            })
            .then(() => this.wallet.setXpub(xpub))
            .then(() => this.mvs.addAddresses(this.addresses))
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

    usernameValid = (username) => {
        if (!username || !DnaUtilRegexProvider.isBtsNameLegal(username)) {
            this.validUsername = false;
            return;
        }


        DnaReqWsSubscribeProvider.getAccount(username).then((data) => {
            if (data && data.length > 0) {
                this.validUsername = true;
            }
        }).catch((e) => {
            this.validUsername = false;
        });
    }

    xpubValid = (xpub) => {
        if(!xpub || !(xpub.startsWith('xpub') || xpub.startsWith('tpub'))) {
            this.validXpub = false
            return
        }
        return this.wallet.getWalletFromMasterPublicKey(xpub)
            .then((wallet) => this.wallet.generateAddresses(wallet, 0, this.globals.index))
            .then((addresses) => {
                this.addresses = addresses
                this.validXpub = true
            })
            .catch((error) => {
                this.validXpub = false
            })
    }

}
