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
    myPublicKey: string = ""
    cosignersLimit: number = 20

    cosigners: Array<string> = []
    nbrSigReq: number;
    nbrSigReqOptions: Array<number> = [2]

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
        this.myPublicKey = ""
    }

    getPublicKey(address) {
        this.alert.showLoading()
            .then(() => this.wallet.getWallet(this.passphrase))
            .then(wallet => this.wallet.getPublicKeyByAddress(wallet, address))
            .then(publicKey => {
                this.alert.stopLoading()
                this.myPublicKey = publicKey
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

    getAddress(cosigners, nbrSigReq, myPublicKey) {
        console.log("Get multisig address")
        console.log("Public keys: " + cosigners.concat(myPublicKey))
        console.log("Required sign." + nbrSigReq)
        try {
            let publicKeys = cosigners.concat(myPublicKey)
            let multisig = this.wallet.getNewMultisigAddress(nbrSigReq, publicKeys)
            console.log(multisig)
            let newMultisig = {
                "d": "",
                "k": publicKeys,
                "m": parseInt(nbrSigReq),
                "n": publicKeys.length,
                "s": myPublicKey,
                "a": multisig.address,
                "r": multisig.script
            };
            this.wallet.getMultisigAddresses()
                .then((multisig_addresses) => {
                    if(multisig_addresses.indexOf(newMultisig.a) !== -1) {
                        this.alert.showError('MULTISIG_ADDRESS_ALREADY_ADD.ERROR', newMultisig.a)
                    } else {
                        this.wallet.addMultisig(newMultisig)
                        this.navCtrl.pop()
                        this.navCtrl.pop()
                        this.navCtrl.push('MultisignaturePage')
                        this.alert.showSent('SUCCESS_CREATE_MULTISIG', multisig.address)
                    }
                })
        } catch (e) {
            console.error(e);
            this.alert.showError('CREATE_MULTISIG.ERROR', e.message)
        }


            //.then((result) => console.log(result))
    }

    addCosigner() {
        this.cosigners.push('')
        this.nbrSigReqOptions.push(this.nbrSigReqOptions.length+2)
    }

    removeCosigner(index) {
        this.cosigners.splice(index, 1)
        this.nbrSigReqOptions.pop()
    }

    validPassword = (password) => (password) ? password.length > 0 : false;

    validAddress = this.mvs.validAddress

    validPublicKey = (publicKey) => (publicKey) ? publicKey.length == 66 : false;

    validnbrSigReq = (nbrSigReq) => nbrSigReq && nbrSigReq > 0
}
