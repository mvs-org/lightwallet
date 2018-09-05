import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';
import { AppGlobals } from '../../app/app.global';

@IonicPage({
    name: 'eth-swap-page',
    segment: 'eth-swap/:asset'
})
@Component({
    selector: 'page-eth-swap',
    templateUrl: 'eth-swap.html',
})
export class EthSwapPage {

    selectedAsset: any
    addresses: Array<string>
    balance: number
    decimals: number
    showBalance: number
    recipient_address: string = ""
    recipient_avatar: string
    quantity: string = ""
    rawtx: string
    addressbalances: Array<any>
    sendFrom: string = "auto"
    changeAddress: string
    passphrase: string = ""
    etpBalance: number
    @ViewChild('quantityInput') quantityInput;
    message: string = ''
    fee: number = 10000
    eth_address: string
    swap_fee: number = 100000000

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private alert: AlertProvider,
        private globals: AppGlobals
    ) {

        this.selectedAsset = navParams.get('asset')
        this.recipient_avatar = this.globals.crosschain_avatar

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

        mvs.getGlobalAvatar(this.recipient_avatar)
                .then(result => {
                    this.recipient_address = result.address
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
                if(this.message) {
                    messages.push(this.message)
                }
                this.eth_address = this.eth_address.trim();
                let eth_message = '{\"type\":\"ETH\",\"address\":\"' + this.eth_address + '\"}';
                messages.push(eth_message)
                return this.mvs.createSendSwapTx(
                    this.passphrase,
                    this.selectedAsset,
                    this.recipient_address,
                    this.recipient_avatar,
                    Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals)),
                    (this.sendFrom != 'auto') ? this.sendFrom : null,
                    (this.changeAddress != 'auto') ? this.changeAddress : undefined,
                    this.fee,
                    messages,
                    this.swap_fee
                )
            })
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
            .then((result) => {
                this.navCtrl.pop()
                this.alert.stopLoading()
                this.alert.showSent('SUCCESS_SEND_TEXT', result.hash)
            })
            .catch((error) => {
                console.error(error)
                this.alert.stopLoading()
                switch(error.message){
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

    validPassword = (passphrase) => (passphrase.length > 0)

    validMessageLength = (message) => this.mvs.verifyMessageSize(message) < 253

    validEthereumAddress = (address) => (address != undefined && address != '' && address.charAt(0) == '0' && address.charAt(1) == 'x' && address.trim().length == 42)

}
