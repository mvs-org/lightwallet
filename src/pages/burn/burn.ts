import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';
import { AppGlobals } from '../../app/app.global';

@IonicPage()
@Component({
    selector: 'page-burn',
    templateUrl: 'burn.html',
})
export class BurnPage {

    selectedAsset: string = 'ETP'
    assetsList: Array<string>
    addresses: Array<string>
    balances: any = {}
    decimals: number
    showBalance: number
    quantity: string = ""
    addressbalances: Array<any>
    sendFrom: string = "auto"
    changeAddress: string
    feeAddress: string = "auto"
    @ViewChild('recipientAddressInput') recipientAddressInput
    @ViewChild('quantityInput') quantityInput
    message: string = ""
    fee: number
    defaultFee: number
    showAdvanced: boolean = false
    addressbalancesObject: any = {}

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private alert: AlertProvider,
        private zone: NgZone,
        private globals: AppGlobals,
    ) {

        this.selectedAsset = navParams.get('asset') || 'ETP'

        //Load addresses and balances
        Promise.all([this.mvs.getBalances(), this.mvs.getAddresses(), this.mvs.getAddressBalances()])
            .then(([balances, addresses, addressbalancesObject]) => {
                this.balances = balances.MST
                this.balances.ETP = balances.ETP
                this.assetsList = Object.keys(this.balances)
                this.assetsList.sort((a, b) =>
                    a.localeCompare(b)
                );
                this.decimals = this.balances[this.selectedAsset].decimals
                this.addresses = addresses
                this.addressbalancesObject = addressbalancesObject
                this.updateBalancePerAddress()
            })

        this.fee = this.globals.default_fees.default
        this.defaultFee = this.fee
        this.mvs.getFees()
            .then(fees => {
                this.fee = fees.default
                this.defaultFee = this.fee
            })
    }

    updateBalancePerAddress() {
        let addrblncs = []
        Object.keys(this.addresses).forEach((index) => {
            let address = this.addresses[index]
            if (this.addressbalancesObject[address]) {
                addrblncs.push({ "address": address, "avatar": this.addressbalancesObject[address].AVATAR ? this.addressbalancesObject[address].AVATAR : "", "identifier": this.addressbalancesObject[address].AVATAR ? this.addressbalancesObject[address].AVATAR : address, "balance": this.selectedAsset == 'ETP' ? this.addressbalancesObject[address].ETP.available : this.addressbalancesObject[address].MST[this.selectedAsset] ? this.addressbalancesObject[address].MST[this.selectedAsset].available : 0 })
            } else {
                addrblncs.push({ "address": address, "avatar": "", "identifier": address, "balance": 0 })
            }
        })
        this.addressbalances = addrblncs
        if(this.sendFrom != 'auto' && (!this.addressbalancesObject[this.sendFrom][this.selectedAsset] || this.addressbalancesObject[this.sendFrom][this.selectedAsset].available < Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals)))) {
            this.sendFrom = 'auto'
        }
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
        && ((this.selectedAsset == 'ETP' && this.balances['ETP'].available >= (Math.round(parseFloat(quantity) * Math.pow(10, this.decimals)) + this.fee)) || (this.selectedAsset != 'ETP' && this.balances[this.selectedAsset].available >= parseFloat(quantity) * Math.pow(10, this.decimals)))
        && (quantity > 0)

    countDecimals(value) {
        if (Math.floor(value) !== value && value.toString().split(".").length > 1)
            return value.toString().split(".")[1].length || 0;
        return 0;
    }

    updateRange() {
        this.zone.run(() => { });
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    confirm() {
        this.alert.confirm(() => this.send(), 'BURN.CONFIRM_TITLE', '', 'BURN.CONFIRM_MESSAGE', 'BURN.CONFIRM_OK', 'BURN.CONFIRM_BACK')
    }

    create() {
        return this.alert.showLoading()
            .then(() => {
                let messages = [];
                if (this.message) {
                    messages.push(this.message)
                }
                return this.mvs.burn(
                    this.selectedAsset,
                    Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals)),
                    (this.sendFrom != 'auto') ? this.sendFrom : null,
                    (this.showAdvanced && this.changeAddress != 'auto') ? this.changeAddress : undefined,
                    (this.showAdvanced) ? this.fee : this.defaultFee,
                    (this.showAdvanced && messages !== []) ? messages : undefined
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
            .then((result) => {
                this.navCtrl.push("confirm-tx-page", { tx: result.encode().toString('hex') })
                this.alert.stopLoading()
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

    validFromAddress = (address: string) => address == 'auto' || (this.addressbalancesObject[address] && this.addressbalancesObject[address].ETP.available !== 0)

    validMessageLength = (message) => this.mvs.verifyMessageSize(message) < 253

    onSelectedAssetChange(event) {
        this.decimals = this.balances[this.selectedAsset].decimals
        this.updateBalancePerAddress()
    }

}
