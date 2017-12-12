import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';

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

    constructor(
        public navCtrl: NavController,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private translate: TranslateService) {

        this.selectedAsset = "ETP"
        this.sendFrom = 'auto'
        this.recipient_address = 'auto'
        this.feeAddress = 'auto'
        this.locktime = 0
        this.custom_recipient = ''
        this.deposit_options=[{option:7, locktime: 25200, rate: 0.0009589},{option:30, locktime: 108000, rate: 0.0066667},{option:90, locktime: 331200, rate: 0.032},{option:182, locktime: 655200, rate: 0.08},{option:365, locktime: 1314000, rate: 0.2}]

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

    validQuantity = (quantity) => quantity != undefined && this.showBalance >= parseFloat(quantity) * Math.pow(10, this.decimals)

    validrecipient = (custom_recipient) => (custom_recipient.length == 34) && ((custom_recipient.charAt(0) == 'M') || (custom_recipient.charAt(0) == '3'))

    customRecipientChanged = () => {if(this.custom_recipient) this.custom_recipient = this.custom_recipient.trim()}

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    preview() {
        this.create()
            .then((tx) => {
            console.log('transaction details: '+tx)
                this.rawtx = tx.encode().toString('hex')
                this.loading.dismiss()
            })
            .catch((error) => {
                console.error(error)
                this.loading.dismiss()
                this.translate.get('ERROR_SEND_TEXT').subscribe((message: string) => {
                    this.showAlert(message)
                })
            })
    }

    create() {
        return this.showLoading()
            .then(() => this.mvs.getMvsAddresses())
            .then((addresses) => this.mvs.createDepositTx(this.passphrase, (this.recipient_address == 'auto') ? null : (this.recipient_address == 'custom') ? this.custom_recipient : this.recipient_address, Math.floor(parseFloat(this.quantity) * Math.pow(10, this.decimals)), this.locktime, (this.sendFrom != 'auto') ? this.sendFrom : null, (this.changeAddress != 'auto') ? this.changeAddress : undefined))
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
            .catch(() => {
                this.loading.dismiss()
                this.translate.get('ERROR_SEND_TEXT').subscribe((message: string) => {
                    this.showAlert(message)
                })
            })
    }

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    round = (val:number) => Math.round(val*100000000)/100000000

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

}
