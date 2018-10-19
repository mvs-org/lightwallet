import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { TranslateService } from '@ngx-translate/core';
import { Keyboard } from '@ionic-native/keyboard';

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
    import_address: string = ""
    @ViewChild('importAddressInput') importAddressInput;
    passphrase_import: string = ""
    validPublicKeys: boolean = false

    customTrackBy(index: number, obj: any): any {
        return index;
    }

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private alert: AlertProvider,
        private barcodeScanner: BarcodeScanner,
        private wallet: WalletServiceProvider,
        private keyboard: Keyboard,
        private translate: TranslateService
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
        if(!this.myPublicKey) {
            this.alert.showError('MULTISIG_MISSING_MY_PUBLIC_KEY.ERROR', '')
        } else if (!this.validPublicKeys) {
            this.alert.showError('MULTISIG_WRONG_PUBLIC_KEYS.ERROR', '')
        } else {
            try {
                let nbrSigns = parseInt(nbrSigReq);
                let publicKeys = cosigners.concat(myPublicKey);
                let multisig = this.wallet.getNewMultisigAddress(nbrSigns, publicKeys)
                let newMultisig = {
                    "d": "",
                    "k": publicKeys,
                    "m": nbrSigns,
                    "n": publicKeys.length,
                    "s": myPublicKey,
                    "a": multisig.address,
                    "r": multisig.script
                };
                this.addMultisigAddress(newMultisig)
            } catch (e) {
                console.error(e);
                this.alert.showError('CREATE_MULTISIG.ERROR', e.message)
            }
        }
    }

    importAddress(address, passphrase) {
        this.alert.showLoading()
            .then(() => {
                try {
                    this.mvs.getMultisigWallet(address.trim())
                        .then((newMultisig) => {
                            if(!newMultisig) {
                                this.alert.stopLoading()
                                this.alert.showError('IMPORT_ADDRESS_UNKNOW.ERROR', '')
                            } else {
                                Promise.all([this.mvs.getAddresses(), this.wallet.getWallet(passphrase)])
                                    .then((result) => {
                                        let addresses = result[0]
                                        let wallet = result[1]
                                        let myPublicKey = undefined;
                                        Promise.all(newMultisig.k.map((publicKey) => {
                                            this.wallet.findDeriveNodeByPublic(wallet, publicKey, addresses ? addresses.length : undefined)
                                                .then(myMultisigWallet => {
                                                    //console.log("Found it!")
                                                    myPublicKey = publicKey;
                                                })
                                                .catch(error=>{
                                                    switch(error.message){
                                                        case "ERR_NO_HDNODE_FOR_PUBLICKEY":
                                                            //not user's public key
                                                            break;
                                                        default:
                                                            console.error(error);
                                                            break;
                                                    }
                                                })
                                        }))
                                        .then(() => {
                                            if(myPublicKey) {
                                                newMultisig.s = myPublicKey
                                                this.addMultisigAddress(newMultisig)
                                            } else {
                                                this.alert.stopLoading()
                                                this.alert.showError('MULTISIG_ADDRESS_NOT_THIS_WALLET.ERROR', '')
                                            }
                                        })
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
                        })
                } catch (e) {
                    console.error(e);
                    this.alert.stopLoading()
                    this.alert.showError('IMPORT_ADDRESS.ERROR', e.message)
                }
            })
    }

    addMultisigAddress(newMultisig) {
        this.wallet.getMultisigAddresses()
            .then((multisig_addresses) => {
                if(multisig_addresses.indexOf(newMultisig.a) !== -1) {
                    this.alert.stopLoading()
                    this.alert.showError('MULTISIG_ADDRESS_ALREADY_ADD.ERROR', newMultisig.a)
                } else {

                    try {
                        this.mvs.addMultisigWallet(newMultisig)
                    } catch (error) {
                        switch(error.message){
                            //TODO
                            case "Error storing wallet":
                                //server already know this address
                                console.error("Server already know this address");
                                break;
                            default:
                                console.error(error);
                                break;
                        }
                    }
                    this.wallet.addMultisig(newMultisig)
                        .then(() => this.mvs.dataReset())
                        .then(() => Promise.all([this.mvs.updateHeight(), this.updateBalances()]))
                        .then(() => this.updateBalances())
                        .then(() => this.alert.stopLoading())
                        .then(() => this.alert.showSent('SUCCESS_CREATE_MULTISIG', newMultisig.a))
                        .then(() => this.navCtrl.pop())
                        .then(() => this.navCtrl.pop())
                        .then(() => this.navCtrl.push('MultisignaturePage'))
                        .catch(error=>{
                            console.error(error)
                            this.alert.stopLoading()
                            this.alert.showError('ADD_MULTISIG.ERROR', error.message)
                        })
                }
            })
    }

    private updateBalances = () => {
        return this.mvs.getData()
            .then(() => this.mvs.setUpdateTime())
            .then(() => this.mvs.getBalances())
            .then((_) => {
                return Promise.all(Object.keys(_.MST).map((symbol) => this.mvs.addAssetToAssetOrder(symbol)))
            })
            .catch((error) => console.error("Can't update balances: " + error))
    }

    scan() {
        this.translate.get(['SCANNING.MESSAGE_ADDRESS']).subscribe((translations: any) => {
            this.barcodeScanner.scan(
                {
                    preferFrontCamera: false,
                    showFlipCameraButton: false,
                    showTorchButton: false,
                    torchOn: false,
                    prompt: translations['SCANNING.MESSAGE_ADDRESS'],
                    resultDisplayDuration: 0,
                    formats: "QR_CODE",
                }).then((result) => {
                    if (!result.cancelled) {
                        let content = result.text.toString().split('&')
                        if (this.mvs.validAddress(content[0]) == true) {
                            this.import_address = content[0]
                            this.importAddressInput.setFocus();
                            this.keyboard.close()
                        } else {
                            this.alert.showWrongAddress()
                        }
                    }
                })
        })
    }

    addCosigner() {
        this.cosigners.push('')
        this.nbrSigReqOptions.push(this.nbrSigReqOptions.length+2)
        this.checkPublicKeys();
    }

    removeCosigner(index) {
        this.cosigners.splice(index, 1)
        this.nbrSigReqOptions.pop()
        this.checkPublicKeys();
    }

    validPassword = (password) => (password) ? password.length > 0 : false;

    validAddress = this.mvs.validAddress

    validPublicKey = (publicKey) => (publicKey) ? publicKey.length == 66 : false;

    validnbrSigReq = (nbrSigReq) => nbrSigReq && nbrSigReq > 0

    checkPublicKeys = () => {
        let valid = true
        this.cosigners.forEach((key) => {
            if(!key || !this.validPublicKey(key))
                valid = false
        })
        this.validPublicKeys = valid
    }
}
