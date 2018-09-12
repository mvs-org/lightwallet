import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AlertProvider } from '../../providers/alert/alert';
import { Keyboard } from '@ionic-native/keyboard';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage()
@Component({
    selector: 'page-multisignature-add',
    templateUrl: 'multisignature-add.html',
})
export class MultisignatureAddPage {

    creation_type: string = "new"
    addressbalances: Array<any>
    addresses: Array<string>
    passphrase: string = ""
    address: string = ""

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private alert: AlertProvider,
        private barcodeScanner: BarcodeScanner,
        private keyboard: Keyboard,
        private translate: TranslateService,
        private wallet: WalletServiceProvider
    ) {

        //Load addresses and balances
        Promise.all([this.mvs.getAddresses(), this.mvs.getAddressBalances()])
            .then((balances) => {
                let addresses = balances[0]
                let addressbalances = balances[1]
                let addrblncs = []
                Object.keys(addresses).forEach((index) => {
                    let address = addresses[index]
                    if (addressbalances[address]) {
                        addrblncs.push({ "address": address, "avatar": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : "", "identifier": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : address, "balance": addressbalances[address].ETP.available })
                    } else {
                        addrblncs.push({ "address": address, "avatar": "", "identifier": address, "balance": 0 })
                    }
                })
                this.addressbalances = addrblncs
            })

    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    getPublicKey(address) {
        /*this.alert.showLoading()
            .then(() => {
                console.log("Password: " + this.passphrase);
                this.wallet.getWallet(this.passphrase)
            })
            .then(wallet => {
                console.log("Got the wallet")
                console.log(wallet)
                console.log(this.wallet.getPublicKeyByAddress(wallet, address))
            })
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
            })*/
    }

    validPassword = (password) => (password) ? password.length > 0 : false;

    validAddress = this.mvs.validAddress
}
