import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AlertProvider } from '../../providers/alert/alert';
import { Keyboard } from '@ionic-native/keyboard';

@IonicPage({
    name: 'transfer-page',
    segment: 'send/:asset'
})
@Component({
    selector: 'page-asset-transfer',
    templateUrl: 'asset-transfer.html',
})
export class AssetTransferPage {

    selectedAsset: any
    addresses: Array<string>
    balance: number
    decimals: number
    showBalance: number
    recipient_address: string = ""
    recipient_avatar: string
    recipient_avatar_valid: boolean
    quantity: string = ""
    builtFor: string
    rawtx: string
    passcodeSet: any
    addressbalances: Array<any>
    sendFrom: string = "auto"
    changeAddress: string
    feeAddress: string = "auto"
    passphrase: string = ""
    etpBalance: number
    @ViewChild('recipientAddressInput') recipientAddressInput;
    @ViewChild('quantityInput') quantityInput;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private alert: AlertProvider,
        private barcodeScanner: BarcodeScanner,
        private keyboard: Keyboard,
        private translate: TranslateService
    ) {

        this.selectedAsset = navParams.get('asset')

        //Load addresses
        mvs.getAddresses()
            .then((_: Array<string>) => {
                this.addresses = _
            })

        //Load balances
        mvs.getBalances()
            .then((balances) => {
                let balance = (this.selectedAsset == 'ETP') ? balances.ETP : balances.MST[this.selectedAsset]
                this.balance = (balance && balance.available) ? balance.available : 0
                this.decimals = balance.decimals
                this.etpBalance = balances.ETP.available
                this.showBalance = this.balance
                return this.mvs.getAddressBalances()
                    .then((addressbalances) => {
                        let addrblncs = []
                        if (Object.keys(addressbalances).length) {
                            Object.keys(addressbalances).forEach((address) => {
                                if (this.selectedAsset == 'ETP') {
                                    if (addressbalances[address].ETP.available > 0) {
                                        addrblncs.push({ "address": address, "balance": addressbalances[address].ETP.available })
                                    }
                                } else {
                                    if (addressbalances[address].MST[this.selectedAsset] && addressbalances[address].MST[this.selectedAsset].available) {
                                        addrblncs.push({ "address": address, "balance": addressbalances[address].MST[this.selectedAsset].available })
                                    }
                                }
                            })
                        }
                        this.addressbalances = addrblncs
                    })
            })
    }

    ionViewDidEnter() {
        this.mvs.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
            })
    }

    onFromAddressChange(event) {
        if (this.sendFrom == 'auto') {
            this.showBalance = this.balance
        } else {
            if (this.addressbalances.length)
                this.addressbalances.forEach((addressbalance) => {
                    if (addressbalance.address == this.sendFrom)
                        this.showBalance = addressbalance.balance
                })
        }
    }

    validQuantity = (quantity) => quantity != undefined
        && this.countDecimals(quantity) <= this.decimals
        && ((this.selectedAsset == 'ETP' && this.showBalance >= (Math.round(parseFloat(quantity) * Math.pow(10, this.decimals)) + 10000)) || (this.selectedAsset != 'ETP' && this.showBalance >= parseFloat(quantity) * Math.pow(10, this.decimals)))
        && ((this.selectedAsset == 'ETP' && quantity >= 10000 / 100000000) || (this.selectedAsset != 'ETP' && quantity > 0))

    countDecimals(value) {
        if (Math.floor(value) !== value && value.toString().split(".").length > 1)
            return value.toString().split(".")[1].length || 0;
        return 0;
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    preview() {
        this.create()
            .then((tx) => {
                this.rawtx = tx.encode().toString('hex')
                this.alert.stopLoading()
            })
            .catch((error) => {
                this.alert.stopLoading()
            })
    }

    create() {
        return this.alert.showLoading()
            .then(() => this.mvs.getAddresses())
            .then((addresses) => this.mvs.createSendTx(
                this.passphrase,
                this.selectedAsset,
                this.recipient_address,
                (this.recipient_avatar && this.recipient_avatar_valid) ? this.recipient_avatar : undefined,
                Math.floor(parseFloat(this.quantity) * Math.pow(10, this.decimals)),
                (this.sendFrom != 'auto') ? this.sendFrom : null,
                (this.changeAddress != 'auto') ? this.changeAddress : undefined
            ))
            .catch((error) => {
                console.error(error.message)
                switch(error.message){
                    case "ERR_DECRYPT_WALLET":
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        break;
                    case "ERR_INSUFFICIENT_BALANCE":
                        this.alert.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
                        break;
                    default:
                        this.alert.showError('MESSAGE.CREATE_TRANSACTION', error.message)
                }
            })
    }

    send() {
        this.create()
            .then(tx => this.mvs.send(tx))
            .then((result) => {
                this.navCtrl.pop()
                this.alert.stopLoading()
                this.alert.showSent('SUCCESS_SEND_TEXT', result.hash)
            })
            .catch((error) => {
                console.error(error)
                this.alert.stopLoading()
                if (error.message == 'ERR_CONNECTION') {
                    this.alert.showError('ERROR_SEND_TEXT', '')
                } else if (error.message == 'ERR_CREATE_TX') {
                    //already handle in create function
                } else {
                    this.alert.showError('MESSAGE.BROADCAST_ERROR', error.message)
                }

            })
    }

    sendAll() {
        if (this.selectedAsset == 'ETP') {
            this.quantity = parseFloat(((this.showBalance / 100000000 - 10000 / 100000000).toFixed(this.decimals)) + "") + ""
        } else {
            this.quantity = parseFloat((this.showBalance / Math.pow(10, this.decimals)).toFixed(this.decimals) + "") + ""
        }
        this.quantityInput.setFocus()
    }

    validrecipient = this.mvs.validAddress

    validAvatar = (input: string) => /[A-Za-z0-9.-]/.test(input) && this.recipient_avatar_valid

    recipientChanged = () => {
        if (this.recipient_address) {
            this.recipient_address = this.recipient_address.trim()
        }
    }
    recipientAvatarChanged = () => {
        if (this.recipient_avatar) {
            this.recipient_avatar = this.recipient_avatar.trim()
            Promise.all([this.mvs.getGlobalAvatar(this.recipient_avatar), this.recipient_avatar])
                .then(result => {
                    if (this.recipient_avatar != result[1])
                        throw ''
                    this.recipient_avatar_valid = true
                    this.recipient_address = result[0].address
                    this.recipientChanged()
                })
                .catch((e) => {
                    this.recipient_avatar_valid = false
                    this.recipient_address = ""
                    this.recipientChanged()
                })
        }
    }

    validPassword = (passphrase) => (passphrase.length > 0)

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
                            this.recipient_address = content[0]
                            this.recipientAddressInput.setFocus();
                            this.keyboard.close()
                        } else {
                            this.alert.showWrongAddress()
                        }
                    }
                })
        })
    }

}
