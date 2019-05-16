import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { AlertProvider } from '../../providers/alert/alert';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@IonicPage({
    name: 'generate-address-page',
    segment: 'addresses'
})
@Component({
    selector: 'page-generate-address',
    templateUrl: 'generate-address.html',
})
export class GenerateAddressPage {

    index: number;
    passphrase: string;

    constructor(
        public navCtrl: NavController,
        private wallet: WalletServiceProvider,
        public navParams: NavParams,
        private alert: AlertProvider,
        private mvs: MvsServiceProvider
    ) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad GenerateAddressPage');
        this.wallet.getAddressIndex()
            .then(index => this.index = index)
    }

    cancel() {
        this.navCtrl.pop();
    }

    setIndex = () => {
        this.alert.showLoading()
            .then(() => this.wallet.getWallet(this.passphrase))
            .then(wallet => {
                let addresses = this.wallet.generateAddresses(wallet, 0, this.index )
                return this.mvs.setAddresses(addresses)
            })
            .then(() => this.wallet.setAddressIndex(this.index))
            .then(() => this.wallet.saveSessionAccount(this.passphrase))
            .then(() => this.alert.stopLoading())
            .then(() => this.navCtrl.setRoot("LoadingPage", { reset: true }))
            .catch(error=>{
                console.error(error)
                this.alert.stopLoading()
                switch(error.message){
                    case "ERR_DECRYPT_WALLET":
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        break;
                    default:
                        this.alert.showError('GENERATE_ADDRESSES.ERROR', error.message)
                        break;
                }
            })

    }

    validIndex = (index: number) => index >= 1 && index <= 50

    validPassword = (passphrase: string) => (passphrase) ? passphrase.length > 3 : false

}
