import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, AlertController, LoadingController, Loading, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
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
    loading: Loading
    recipient_address: string
    quantity: string
    builtFor: string
    rawtx: string
    passcodeSet: any
    addressbalances: Array<any>
    sendFrom: string
    changeAddress: string
    feeAddress: string
    passphrase: string
    etpBalance: number
    @ViewChild('recipientAddressInput') recipientAddressInput;
    @ViewChild('quantityInput') quantityInput;

    constructor(
        public navCtrl: NavController,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private barcodeScanner: BarcodeScanner,
        private keyboard: Keyboard,
        private translate: TranslateService) {

        this.selectedAsset = navParams.get('asset')
        this.sendFrom = 'auto'
        this.feeAddress = 'auto'
        this.recipient_address = ''
        this.quantity = ''

        //Load addresses
        mvs.getMvsAddresses()
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
        console.log('Asset transfer page loaded')
        this.mvs.getMvsAddresses()
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

    validQuantity = (quantity) => quantity != undefined && this.showBalance >= parseFloat(quantity) * Math.pow(10, this.decimals) && this.countDecimals(quantity) <= this.decimals && ((this.selectedAsset == 'ETP' && quantity >= 10000/100000000) || (this.selectedAsset != 'ETP' && quantity > 0))

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
                this.loading.dismiss()
            })
            .catch((error) => {
                this.loading.dismiss()
            })
    }

    create() {
        return this.showLoading()
            .then(() => this.mvs.getMvsAddresses())
            .then((addresses) => this.mvs.createTx(
                this.passphrase,
                this.selectedAsset,
                this.recipient_address,
                Math.floor(parseFloat(this.quantity) * Math.pow(10, this.decimals)),
                (this.sendFrom != 'auto') ? this.sendFrom : null,
                (this.changeAddress != 'auto') ? this.changeAddress : undefined
            ))
            .catch((error) => {
                console.error(error.message)
                if (error.message == "ERR_DECRYPT_WALLET")
                    this.showError('MESSAGE.PASSWORD_WRONG')
                else
                    this.showError('MESSAGE.CREATE_TRANSACTION')
            })
    }

    send() {
        this.create()
            .then((tx) => this.mvs.broadcast(tx.encode().toString('hex')))
            .then((result: any) => {
                this.navCtrl.pop()
                this.translate.get('SUCCESS_SEND_TEXT').subscribe((message: string) => {
                    this.showSent(message, result.hash)
                })
            })
            .catch((error) => {
                this.loading.dismiss()
                if (error.message == 'ERR_CONNECTION')
                    this.showError('ERROR_SEND_TEXT')
                else if (error.message == 'ERR_BROADCAST')
                    this.showError('MESSAGE.BROADCAST_ERROR')
            })
    }

    sendAll() {
        if(this.selectedAsset == 'ETP') {
            this.quantity = (this.showBalance/Math.pow(10, this.decimals) - 10000/100000000) + ""
        } else {
            this.quantity = (this.showBalance/Math.pow(10, this.decimals)) + ""
        }
        this.quantityInput.setFocus()
    }

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    validrecipient = this.mvs.validAddress

    recipientChanged = () => { if (this.recipient_address) this.recipient_address = this.recipient_address.trim() }

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

    showError(message_key) {
        this.translate.get(['MESSAGE.ERROR_TITLE', message_key, 'OK']).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['MESSAGE.ERROR_TITLE'],
                message: translations[message_key],
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
                        this.recipient_address = content[0]
                        this.recipientAddressInput.setFocus();
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
