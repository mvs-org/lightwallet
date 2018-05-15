import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, AlertController, LoadingController, Loading, Platform } from 'ionic-angular';
import { AppGlobals } from '../../app/app.global';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Keyboard } from '@ionic-native/keyboard';
//import { Clipboard } from '@ionic-native/clipboard';

@IonicPage()
@Component({
    selector: 'page-deposit',
    templateUrl: 'deposit.html',
})
export class DepositPage {

    selectedAsset: any
    addresses: Array<string>
    balance: number
    decimals: number
    showBalance: number
    loading: Loading
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

    constructor(
        public navCtrl: NavController,
        private alertCtrl: AlertController,
        private globals: AppGlobals,
        private loadingCtrl: LoadingController,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private barcodeScanner: BarcodeScanner,
        private keyboard: Keyboard,
        //private clipboard: Clipboard,
        private translate: TranslateService) {

        this.selectedAsset = "ETP"
        this.sendFrom = 'auto'
        this.recipient_address = 'auto'
        this.feeAddress = 'auto'
        this.locktime = 0
        this.custom_recipient = ''
        this.passphrase = ''

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
                let balance: any = balances[this.selectedAsset]
                this.balance = (balance && balance.available) ? balance.available : 0
                this.decimals = balance.decimals
                this.etpBalance = balances['ETP'].available
                this.showBalance = this.balance
                return this.mvs.getAddressBalances()
                    .then((addressbalances) => {
                        let addrblncs = []
                        if (Object.keys(addressbalances).length) {
                            Object.keys(addressbalances).forEach((address) => {
                                if (addressbalances[address][this.selectedAsset] && addressbalances[address][this.selectedAsset].available) {
                                    addrblncs.push({ "address": address, "balance": addressbalances[address][this.selectedAsset].available })
                                }
                            })
                        }
                        this.addressbalances = addrblncs
                    })
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

    onSendToAddressChange(event) {

    }

    validQuantity = (quantity) => quantity != undefined
        && this.countDecimals(quantity) <= this.decimals
        && this.showBalance >= (Math.round(parseFloat(quantity) * Math.pow(10, this.decimals)) + 10000)
        && quantity >= 10000/100000000

    countDecimals(value) {
        if (Math.floor(value) !== value && value.toString().split(".").length > 1)
            return value.toString().split(".")[1].length || 0;
        return 0;
    }

    validLocktime = (locktime) => locktime != 0

    validrecipient = this.mvs.validAddress

    customRecipientChanged = () => { if (this.custom_recipient) this.custom_recipient = this.custom_recipient.trim() }

    validPassword = (passphrase) => (passphrase.length > 0)

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    preview() {
        this.create()
            .then((tx) => {
                console.log('transaction details: ' + tx)
                this.rawtx = tx.encode().toString('hex')
                this.loading.dismiss()
            })
            .catch((error) => {
                this.loading.dismiss()
            })
    }

    create() {
        return this.showLoading()
            .then(() => this.mvs.getAddresses())
            .then((addresses) => this.mvs.createDepositTx(this.passphrase, (this.recipient_address == 'auto') ? null : (this.recipient_address == 'custom') ? this.custom_recipient : this.recipient_address, Math.floor(parseFloat(this.quantity) * Math.pow(10, this.decimals)), this.locktime, (this.sendFrom != 'auto') ? this.sendFrom : null, (this.changeAddress != 'auto') ? this.changeAddress : undefined))
            .catch((error) => {
                if (error.message == "ERR_DECRYPT_WALLET")
                    this.showError('MESSAGE.PASSWORD_WRONG','')
                else if (error.message == "ERR_INSUFFICIENT_BALANCE")
                    this.showError('MESSAGE.INSUFFICIENT_BALANCE','')
                else
                    this.showError('MESSAGE.CREATE_TRANSACTION',error)
                throw Error('ERR_CREATE_TX')
            })
    }

    send() {
        this.create()
            .then((tx) => this.mvs.broadcast(tx.encode().toString('hex')))
            .then((result: any) => {
                this.navCtrl.pop()
                this.translate.get('SUCCESS_SEND_TEXT').subscribe((message: string) => {
                    if(this.platform.is('mobile')) {
                        this.showSentMobile(message, result.hash)
                    } else {
                        this.showSent(message, result.hash)
                    }
                })
            })
            .catch((error) => {
                this.loading.dismiss()
                if (error.message == 'ERR_CONNECTION')
                    this.showError('ERROR_SEND_TEXT','')
                else if (error.message == 'ERR_BROADCAST') {
                    this.translate.get('MESSAGE.ONE_TX_PER_BLOCK').subscribe((message: string) => {
                        this.showError('MESSAGE.BROADCAST_ERROR',message)
                    })
                }
            })
    }

    sendAll() {
        this.quantity = parseFloat(((this.showBalance/100000000 - 10000/100000000).toFixed(this.decimals)) + "") + ""
        this.quantityInput.setFocus()
    }

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    round = (val: number) => Math.round(val * 100000000) / 100000000

    showLoading() {
        return new Promise((resolve, reject) => {
            this.translate.get('MESSAGE.LOADING').subscribe((loading: string) => {
                this.loading = this.loadingCtrl.create({
                    content: loading,
                    dismissOnPageChange: true
                })
                this.loading.present()
                resolve()
            })
        })
    }

    showSent(text, hash) {
        this.translate.get('MESSAGE.SUCCESS').subscribe((title: string) => {
            this.translate.get('OK').subscribe((ok: string) => {
                let alert = this.alertCtrl.create({
                    title: title,
                    subTitle: text + hash,
                    buttons: [ok]
                })
                alert.present(prompt)
            })
        })
    }

    showSentMobile(text, hash) {
        this.translate.get(['MESSAGE.SUCCESS','OK','COPY']).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['MESSAGE.SUCCESS'],
                subTitle: text + hash,
                buttons: [
                    /*{
                        text: translations['COPY'],
                        role: 'copy',
                        handler: () => {
                            this.clipboard.copy(hash).then(
                                (resolve: string) => {
                                  console.log(resolve);
                                },
                                (reject: string) => {
                                  console.error('Error: ' + reject);
                                })
                        }
                    },*/
                    {
                        text: translations['OK'],
                    }
                ]
            })
            alert.present(prompt)
        })
    }

    showAlert(text) {
        this.translate.get('MESSAGE.ERROR_TITLE').subscribe((title: string) => {
            this.translate.get('OK').subscribe((ok: string) => {
                let alert = this.alertCtrl.create({
                    title: title,
                    subTitle: text,
                    buttons: [ok]
                })
                alert.present(prompt)
            })
        })
    }

    showError(message_key, error) {
        this.translate.get(['MESSAGE.ERROR_TITLE', message_key, 'OK']).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['MESSAGE.ERROR_TITLE'],
                subTitle: translations[message_key],
                message: error,
                buttons: [{
                    text: translations['OK']
                }]
            });
            alert.present(alert);
        })
    }

    showWrongAddress() {
        this.translate.get(['MESSAGE.NOT_ETP_ADDRESS_TITLE', 'MESSAGE.NOT_ETP_ADDRESS_TEXT', 'OK']).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['MESSAGE.NOT_ETP_ADDRESS_TITLE'],
                message: translations['MESSAGE.NOT_ETP_ADDRESS_TEXT'],
                buttons: [{
                    text: translations['OK']
                }]
            });
            alert.present(alert);
        })
    }


    scan() {
        this.translate.get(['SCANNING.MESSAGE_ADDRESS']).subscribe((translations: any) => {
            this.barcodeScanner.scan(
            {
                preferFrontCamera : false, // iOS and Android
                showFlipCameraButton : false, // iOS and Android
                showTorchButton : false, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                prompt : translations['SCANNING.MESSAGE_ADDRESS'], // Android
                resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
            }).then((result) => {
                if (!result.cancelled) {
                    let content = result.text.toString().split('&')
                    if(this.mvs.validAddress(content[0]) == true) {
                        this.custom_recipient = content[0]
                        this.customInput.setFocus();
                        this.keyboard.close()
                    } else {
                        this.showWrongAddress()
                    }
                } else {

                }
            })
        })
    }

}
