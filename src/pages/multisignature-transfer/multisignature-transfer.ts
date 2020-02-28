import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AlertProvider } from '../../providers/alert/alert';
import { Keyboard } from '@ionic-native/keyboard';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { AppGlobals } from '../../app/app.global';

@IonicPage()
@Component({
    selector: 'page-multisignature-transfer',
    templateUrl: 'multisignature-transfer.html',
})
export class MultisignatureTransferPage {

    selectedAsset: any
    addresses: Array<string>
    balance: number
    decimals: number
    showBalance: number
    recipient_address: string = ""
    recipient_avatar: string
    recipient_avatar_valid: boolean
    quantity: string = ""
    rawtx: string
    addressbalances: Array<any>
    sendFrom: string = "auto"
    changeAddress: string
    feeAddress: string = "auto"
    passphrase: string = ""
    etpBalance: number
    @ViewChild('recipientAddressInput') recipientAddressInput;
    @ViewChild('quantityInput') quantityInput;
    total_to_send: any = {}
    sendMoreValidQuantity: boolean = false
    sendMoreValidAddress: boolean = false
    sendMore_limit: number = 1000
    total: number
    message: string = ""
    fee: number
    type: string = "create"
    input: string
    signedTx: string
    address_info: any
    isApp: boolean
    showAdvanced: boolean = false

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private alert: AlertProvider,
        private barcodeScanner: BarcodeScanner,
        private keyboard: Keyboard,
        private wallet: WalletServiceProvider,
        private translate: TranslateService,
        private zone: NgZone,
        private globals: AppGlobals,
    ) {

        this.selectedAsset = navParams.get('asset')
        this.sendFrom = navParams.get('address')
        this.total_to_send[this.selectedAsset] = 0
        this.total = 0
        this.isApp = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'));

        //Load addresses
        mvs.getAddresses()
            .then((_: Array<string>) => {
                this.addresses = _
            })

        this.mvs.getAddressBalances()
            .then((addressbalances) => {
                if (!addressbalances[this.sendFrom]) {
                    addressbalances[this.sendFrom] = {}
                    addressbalances[this.sendFrom].AVATAR = ""
                    addressbalances[this.sendFrom].ETP = {}
                    addressbalances[this.sendFrom].ETP.available = 0
                    addressbalances[this.sendFrom].ETP.frozen = 0
                    addressbalances[this.sendFrom].ETP.decimals = 8
                    addressbalances[this.sendFrom].MIT = []
                    addressbalances[this.sendFrom].MST = {}
                }
                this.decimals = (this.selectedAsset == 'ETP') ? addressbalances[this.sendFrom]['ETP'].decimals : addressbalances[this.sendFrom]['MST'][this.selectedAsset].decimals
                this.etpBalance = addressbalances[this.sendFrom]['ETP'].available
                let addrblncs = []
                this.showBalance = this.selectedAsset == 'ETP' ? addressbalances[this.sendFrom].ETP.available : addressbalances[this.sendFrom].MST[this.selectedAsset].available
                if (Object.keys(addressbalances).length) {
                    Object.keys(addressbalances).forEach((address) => {
                        if (this.selectedAsset == 'ETP') {
                            if (addressbalances[address].ETP.available > 0) {
                                addrblncs.push({ "address": address, "avatar": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : "", "identifier": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : address, "balance": addressbalances[address].ETP.available })
                            }
                        } else {
                            if (addressbalances[address].MST[this.selectedAsset] && addressbalances[address].MST[this.selectedAsset].available) {
                                addrblncs.push({ "address": address, "avatar": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : "", "identifier": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : address, "balance": addressbalances[address].MST[this.selectedAsset].available })
                            }
                        }
                    })
                }
                this.addressbalances = addrblncs

            })

        this.wallet.getMultisigInfoFromAddress(this.sendFrom)
            .then((info) => this.address_info = info)

        this.fee = this.globals.default_fees.default
        this.mvs.getFees()
            .then(fees => this.fee = fees.default)
    }

    ionViewDidEnter() {
        this.mvs.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
            })
    }

    validQuantity = (quantity) => quantity != undefined
        && this.countDecimals(quantity) <= this.decimals
        && ((this.selectedAsset == 'ETP' && this.showBalance >= (Math.round(parseFloat(quantity) * Math.pow(10, this.decimals)) + this.fee)) || (this.selectedAsset != 'ETP' && this.showBalance >= parseFloat(quantity) * Math.pow(10, this.decimals)))
        && (quantity > 0)

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
            .then((addresses) => {
                let messages = [];
                if (this.message) {
                    messages.push(this.message)
                }
                return this.mvs.createSendMultisigTx(
                    this.passphrase,
                    this.selectedAsset,
                    this.recipient_address,
                    (this.recipient_avatar && this.recipient_avatar_valid) ? this.recipient_avatar : undefined,
                    Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals)),
                    this.sendFrom,
                    (this.showAdvanced && this.changeAddress != 'auto') ? this.changeAddress : undefined,
                    (this.showAdvanced) ? this.fee : 10000,
                    (this.showAdvanced && messages !== []) ? messages : undefined,
                    this.address_info
                )
            })
            .catch((error) => {
                console.error(error.message)
                this.alert.stopLoading()
                switch (error.message) {
                    case "ERR_DECRYPT_WALLET":
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        throw Error('ERR_CREATE_TX')
                    case "ERR_INSUFFICIENT_BALANCE":
                        this.alert.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
                        throw Error('ERR_CREATE_TX')
                    case "ERR_TOO_MANY_INPUTS":
                        this.alert.showErrorTranslated('ERROR_TOO_MANY_INPUTS', 'ERROR_TOO_MANY_INPUTS_TEXT')
                        throw Error('ERR_CREATE_TX')
                    default:
                        this.alert.showError('MESSAGE.CREATE_TRANSACTION', error.message)
                        throw Error('ERR_CREATE_TX')
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
                switch (error.message) {
                    case "ERR_CONNECTION":
                        this.alert.showError('ERROR_SEND_TEXT', '')
                        break;
                    case "ERR_CREATE_TX":
                        //already handle in create function
                        break;
                    default:
                        this.alert.showError('MESSAGE.BROADCAST_ERROR', error.message)
                }
            })
    }

    sendAll = () => this.alert.showSendAll(() => {
        if (this.selectedAsset == 'ETP') {
            this.quantity = parseFloat(((this.showBalance / 100000000 - this.fee / 100000000).toFixed(this.decimals)) + "") + ""
        } else {
            this.quantity = parseFloat((this.showBalance / Math.pow(10, this.decimals)).toFixed(this.decimals) + "") + ""
        }
        this.quantityInput.setFocus()
    })

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

    validMessageLength = (message) => this.mvs.verifyMessageSize(message) < 253

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

    decode(tx) {
        this.mvs.decodeTx(tx)       //Try if the transaction can be decoded, if not, shows an error
            .then((result) => this.navCtrl.push("confirm-tx-page", { tx: tx }))
            .catch((error) => {
                console.error(error);
                this.alert.showErrorTranslated('MESSAGE.ERROR_DECODE_MULTISIG_SUBTITLE', 'MESSAGE.ERROR_DECODE_MULTISIG_BODY')
            })
    }

    updateRange() {
        this.zone.run(() => { });
    }

}
