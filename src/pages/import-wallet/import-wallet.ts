import { Component } from '@angular/core';
import { IonicPage, NavController, Loading } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { TranslateService } from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { DnaUtilRegexProvider } from "../../providers/dna-util-regex/dna-util-regex";
import { DnaUtilUtilProvider } from "../../providers/dna-util-util/dna-util-util";
import { DnaWalletProvider } from "../../providers/dna-wallet/dna-wallet";
import {DnaReqWsSubscribeProvider} from "../../providers/dna-req-ws-subscribe/dna-req-ws-subscribe";

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
        private storage: Storage,
    ) {

        this.fileLoaded = false;

    }

    open(e) {
        let file = e.target.files
        let reader = new FileReader();
        reader.onload = (e: any) => {
            let content = e.target.result;

            try {
                this.data       = JSON.parse(content)
                this.fileLoaded = true
                //this.wallet.setWallet(this.data).then(() => this.fileLoaded = true)
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
        this.alert.showLoading();
        this.storage.set('walletHasDna', false)
            .then(() => this.storage.set('walletHasEtp', false))
            .then(() => this.storage.set('walletType', 'etp'))
            .then(() => this.storage.set('dnaUserInfo', null))
            .then(() => this.decryptDna(password));
    }

    // DNA
    decryptDna(password) {
        let dnaNet = 'bts';

        // 检查是否有ETP
        if (!this.data['etp']) {
            this.alert.showError('MESSAGE.PASSWORD_WRONG', '');
            this.alert.stopLoading()

            return;
        }

        if (this.data['dna'] && this.data['dna'].key && this.data['dna'].net == dnaNet) {
            let key = DnaUtilUtilProvider.decryptKey(this.data['dna'].key, password)
            if (key.length > 0) {
                let that = this;
                let info = DnaWalletProvider.getAccountInfo(key, dnaNet);
                DnaReqWsSubscribeProvider.wsFetchBtsGetAccount(info['publicKey'])
                    .then((data) => {
                        if (data[0].length <= 0) {
                            throw 'DNA.NO_ACCOUNT';
                        }

                        return data[0][0];
                    })
                    .then((btsId) => DnaReqWsSubscribeProvider.wsFetchBtsGetAccountDetail(btsId))
                    .then((accountData) => {
                        return {
                            name: accountData[0].name,
                            address: accountData[0].name,
                            key: that.data['dna'].key,
                        };
                    })
                    .then((userInfo) => that.storage.set('dnaUserInfo', userInfo))
                    .then(() => that.storage.set('walletHasDna', true))
                    .then(() => that.decryptEtp(password))
                    .catch((e) => {
                        if (e === 'DNA.NO_ACCOUNT') {
                            that.alert.showError('DNA.NO_ACCOUNT', '');
                        } else {
                            that.alert.showError('MESSAGE.PASSWORD_WRONG', '');
                        }

                        console.log(e);
                        that.alert.stopLoading()
                    });
            } else {
                this.alert.showError('MESSAGE.PASSWORD_WRONG', '');
                this.alert.stopLoading()
            }
        } else {
            this.decryptEtp(password);
        }
    }

    // ETP
    decryptEtp(password) {
        this.wallet.setWallet(this.data['etp'])
            .then(() => this.storage.set('walletHasEtp', true))
            .then(() => this.mvs.dataReset())
            .then(() => this.wallet.setSeed(password))
            .then(() => this.wallet.getMasterPublicKey(password))
            .then((xpub) => this.wallet.setXpub(xpub))
            .then(() => Promise.all([this.wallet.getWallet(password), this.wallet.getAddressIndexFromWallet()]))
            .then(([wallet, index]) => this.wallet.generateAddresses(wallet, 0, index))
            .then((addresses) => this.mvs.setAddresses(addresses))
            .then(() => this.wallet.saveSessionAccount(password))
            .then(() => this.nav.setRoot("LoadingPage", { reset: true }))
            .catch((e) => {
                console.log(e);
                this.alert.showError('MESSAGE.PASSWORD_WRONG', '');
                this.alert.stopLoading()
            });
    }

    passwordValid = (password) => {
        return password && DnaUtilRegexProvider.isPasswordLegal(password)
    }
}
