import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';
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
    publicKey: string = ""
    cosignersLimit: number = 20

    cosigners: Array<string> = []

    customTrackBy(index: number, obj: any): any {
        return index;
    }

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private alert: AlertProvider,
        private wallet: WalletServiceProvider
    ) {

        this.cosigners.push('')

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

    onAddressChange(event) {
        this.publicKey = ""
    }

    getPublicKey(address) {
        this.alert.showLoading()
            .then(() => this.wallet.getWallet(this.passphrase))
            .then(wallet => this.wallet.getPublicKeyByAddress(wallet, address))
            .then(publicKey => {
                this.alert.stopLoading()
                this.publicKey = publicKey
            })
            .catch(error=>{
                console.error(error)
                this.alert.stopLoading()
                switch(error.message){
                    case "ERR_DECRYPT_WALLET":
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        break;
                    default:
                        this.alert.showError('GET_PUBLIC_KEY.ERROR', error.message)
                        break;
                }
            })
    }

    getAddress() {
        console.log("Get multisig address")
    }

    addCosigner() {
        //this.cosigners.push('')
        this.cosigners = [...this.cosigners, ''];
        console.log(this.cosigners)
    }

    removeCosigner(index) {
        this.cosigners.splice(index, 1)
    }

    cosignerChanged(index) {
        console.log("Changed index: " + index)
        console.log("Index value: " + this.cosigners[index])
        console.log("Full info: " + this.cosigners)
    }

    validPassword = (password) => (password) ? password.length > 0 : false;

    validAddress = this.mvs.validAddress

    validPublicKey = (publicKey) => (publicKey) ? publicKey.length == 66 : false;
}
