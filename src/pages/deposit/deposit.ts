import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { AppGlobals } from '../../app/app.global';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AlertProvider } from '../../providers/alert/alert';
import { Keyboard } from '@ionic-native/keyboard';

@IonicPage()
@Component({
    selector: 'page-deposit',
    templateUrl: 'deposit.html',
})
export class DepositPage {

    addresses: Array<string>
    decimals: number
    showBalance: number
    sendTo: string
    quantity: string
    builtFor: string
    rawtx: string
    passcodeSet: any
    addressbalances: Array<any>
    deposit_options: Array<any>
    sendFrom: string
    recipient_address: string
    custom_recipient: string
    locktime: number
    changeAddress: string
    feeAddress: string
    passphrase: string
    etpBalance: number
    @ViewChild('customInput') customInput;
    @ViewChild('quantityInput') quantityInput;
    selectedAsset: any
    message: string = ""
    fee: number = 10000
    blocktime: number
    duration_days: number = 0
    duration_hours: number = 0

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private alert: AlertProvider,
        private globals: AppGlobals,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private barcodeScanner: BarcodeScanner,
        private keyboard: Keyboard,
        private translate: TranslateService) {

        this.sendFrom = 'auto'
        this.recipient_address = 'auto'
        this.feeAddress = 'auto'
        this.locktime = 0
        this.custom_recipient = ''
        this.passphrase = ''
        this.selectedAsset = navParams.get('asset')
        //this.blocktime = mvs.getBlocktime()

        if (this.globals.network == 'mainnet')
            this.deposit_options = [
                { option: 7, locktime: 25200, rate: 0.0009589 },
                { option: 30, locktime: 108000, rate: 0.0066667 },
                { option: 90, locktime: 331200, rate: 0.032 },
                { option: 182, locktime: 655200, rate: 0.08 },
                { option: 365, locktime: 1314000, rate: 0.2 }
            ]
        else
            this.deposit_options = [
                { option: 7, locktime: 10, rate: 0.0009589 },
                { option: 30, locktime: 20, rate: 0.0066667 },
                { option: 90, locktime: 30, rate: 0.032 },
                { option: 182, locktime: 40, rate: 0.08 },
                { option: 365, locktime: 50, rate: 0.2 }
            ]

        //Load addresses
        mvs.getAddresses()
            .then((_: Array<string>) => {
                this.addresses = _
            })

        //Load balances
        mvs.getBalances()
            .then((balances) => {
                let balance: any = balances.ETP
                this.decimals = balance.decimals
                this.etpBalance = balances['ETP'].available
                this.showBalance = this.etpBalance
                return this.mvs.getAddressBalances()
                    .then((addressbalances) => {
                        let addrblncs = []
                        if (Object.keys(addressbalances).length) {
                            Object.keys(addressbalances).forEach((address) => {
                                if (addressbalances[address].ETP && addressbalances[address].ETP.available) {
                                    addrblncs.push({ "address": address, "balance": addressbalances[address].ETP.available })
                                }
                            })
                        }
                        this.addressbalances = addrblncs
                    })
            })

        mvs.getHeight()
            .then(height => mvs.getBlocktime(height))
            .then(blocktime => this.blocktime = blocktime)
            .catch((error) => {
                console.error(error.message)
            })

    }

    ionViewDidEnter() {
        console.log('Deposit page loaded')
        this.mvs.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
            })
    }

    onDepositOptionChange(event) {
        this.duration_days = Math.floor(this.blocktime * this.locktime / (24 * 60 * 60))
        this.duration_hours = Math.floor((this.blocktime * this.locktime / (60 * 60)) - (24 * this.duration_days))
    }

    onFromAddressChange(event) {
        if (this.sendFrom == 'auto') {
            this.showBalance = this.etpBalance
        } else {
            if (this.addressbalances.length)
                this.addressbalances.forEach((addressbalance) => {
                    if (addressbalance.address == this.sendFrom)
                        this.showBalance = addressbalance.balance
                })
        }
    }

    onSendToAddressChange(event) {

    }

    validQuantity = (quantity) => quantity != undefined
        && this.countDecimals(quantity) <= this.decimals
        && this.showBalance >= (Math.round(parseFloat(quantity) * Math.pow(10, this.decimals)) + this.fee)
        && quantity >= this.fee / 100000000

    countDecimals(value) {
        if (Math.floor(value) !== value && value.toString().split(".").length > 1)
            return value.toString().split(".")[1].length || 0;
        return 0;
    }

    validLocktime = (locktime) => locktime != 0

    validrecipient = this.mvs.validAddress

    customRecipientChanged = () => { if (this.custom_recipient) this.custom_recipient = this.custom_recipient.trim() }

    validPassword = (passphrase) => (passphrase.length > 0)

    validMessageLength = (message) => this.mvs.verifyMessageSize(message) < 253

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    preview() {
        this.create()
            .then((tx) => {
                console.log('transaction details: ' + tx)
                this.rawtx = tx.encode().toString('hex')
                this.alert.stopLoading()
            })
            .catch((error) => {
                this.alert.stopLoading()
            })
    }

    create() {
        let messages = [];
        if(this.message) {
            messages.push(this.message)
        }
        return this.alert.showLoading()
            .then(() => this.mvs.getAddresses())
            .then((addresses) => this.mvs.createDepositTx(
                this.passphrase,
                (this.recipient_address == 'auto') ? null : (this.recipient_address == 'custom') ? this.custom_recipient : this.recipient_address,
                Math.floor(parseFloat(this.quantity) * Math.pow(10, this.decimals)),
                this.locktime,
                (this.sendFrom != 'auto') ? this.sendFrom : null,
                (this.changeAddress != 'auto') ? this.changeAddress : undefined,
                this.fee,
                (messages !== []) ? messages : undefined)
            )
            .catch((error) => {
                console.error(error.message)
                switch(error.message){
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
            .then((result: any) => {
                this.navCtrl.setRoot('AccountPage')
                this.alert.stopLoading()
                this.alert.showSent('SUCCESS_SEND_TEXT', result.hash)
            })
            .catch((error) => {
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

    sendAll = () => this.alert.showSendAll(() => {
        this.quantity = parseFloat(((this.showBalance / 100000000 - this.fee / 100000000).toFixed(this.decimals)) + "") + ""
        this.quantityInput.setFocus()
    })

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    round = (val: number) => Math.round(val * 100000000) / 100000000

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
                            this.custom_recipient = content[0]
                            this.customInput.setFocus();
                            this.keyboard.close()
                        } else {
                            this.alert.showWrongAddress()
                        }
                    } else {

                    }
                })
        })
    }

}
