import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { AlertProvider } from '../../providers/alert/alert';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AppGlobals } from '../../app/app.global';

@IonicPage({
    name: 'generate-address-page',
    segment: 'addresses'
})
@Component({
    selector: 'page-generate-address',
    templateUrl: 'generate-address.html',
})
export class GenerateAddressPage {

    index: number
    passphrase: string
    walletFromXpub: any

    constructor(
        public navCtrl: NavController,
        private wallet: WalletServiceProvider,
        public navParams: NavParams,
        private alert: AlertProvider,
        private mvs: MvsServiceProvider,
        private globals: AppGlobals,
    ) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad GenerateAddressPage');
        this.wallet.getAddressIndex()
            .then(index => this.index = index)

        this.wallet.getXpub()
            .then((xpub) => {
                if (xpub) {
                    this.wallet.getWalletFromMasterPublicKey(xpub)
                        .then((wallet) => this.walletFromXpub = wallet)
                }
            })
    }

    cancel() {
        this.navCtrl.pop();
    }

    setIndexFromWallet = () => {
        this.alert.showLoading()
            .then(() => this.wallet.getWallet(this.passphrase))
            .then(wallet => {
                let addresses = this.wallet.generateAddresses(wallet, 0, this.index)
                return this.mvs.setAddresses(addresses)
            })
            .then(() => this.wallet.getMasterPublicKey(this.passphrase))
            .then((xpub) => this.wallet.setXpub(xpub))
            .then(() => this.alert.stopLoading())
            .then(() => this.navCtrl.setRoot("LoadingPage", { reset: true }))
            .catch(error => {
                console.error(error)
                this.alert.stopLoading()
                switch (error.message) {
                    case "ERR_DECRYPT_WALLET":
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        break;
                    default:
                        this.alert.showError('GENERATE_ADDRESSES.ERROR', error.message)
                        break;
                }
            })
    }

    setIndexFromXpub = () => {
        this.alert.showLoading()
            .then(() => {
                let addresses = this.wallet.generateAddresses(this.walletFromXpub, 0, this.index)
                return this.mvs.setAddresses(addresses)
            })
            .then(() => this.alert.stopLoading())
            .then(() => this.navCtrl.setRoot("LoadingPage", { reset: true }))
            .catch(error => {
                console.error(error)
                this.alert.stopLoading()
                switch (error.message) {
                    case "ERR_DECRYPT_WALLET":
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        break;
                    default:
                        this.alert.showError('GENERATE_ADDRESSES.ERROR', error.message)
                        break;
                }
            })
    }

    validIndex = (index: number) => index >= 2 && index <= this.globals.max_addresses

    validPassword = (passphrase: string) => (passphrase) ? passphrase.length > 3 : false

}
