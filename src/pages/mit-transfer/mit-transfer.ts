import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Loading } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';
import { AppGlobals } from '../../app/app.global';

@IonicPage()
@Component({
    selector: 'page-mit-transfer',
    templateUrl: 'mit-transfer.html',
})
export class MITTransferPage {

    recipient_address: string = ""
    recipient_address_last_update: number = 0
    recipient_avatar: string = ""
    symbol: string
    recipient_avatar_valid: boolean = false
    loading: Loading
    etpBalance: number
    addressbalances: Array<any>
    defaultFee: number
    fee: number
    showAdvanced: boolean = false

    constructor(
        public navCtrl: NavController,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private alert: AlertProvider,
        public navParams: NavParams,
        private zone: NgZone,
        private globals: AppGlobals,
    ) {
        this.symbol = this.navParams.get('symbol')
        mvs.getBalances()
            .then((balances) => {
                this.etpBalance = balances.ETP.available
                return this.mvs.getAddressBalances()
                    .then((addressbalances) => {
                        let addrblncs = []
                        if (Object.keys(addressbalances).length) {
                            Object.keys(addressbalances).forEach((address) => {
                                if (addressbalances[address].ETP.available > 0) {
                                    addrblncs.push({ "address": address, "balance": addressbalances[address].ETP.available })
                                }
                            })
                        }
                        this.addressbalances = addrblncs
                    })
            })

        this.fee = this.globals.default_fees.default
        this.defaultFee = this.fee
        this.mvs.getFees()
            .then(fees => {
                this.fee = fees.default
                this.defaultFee = this.fee
            })
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad MitTransferPage');
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    create() {
        return this.alert.showLoading()
            .then(() => this.mvs.createTransferMITTx(
                "", //Sender avatar
                this.recipient_address,
                this.recipient_avatar,
                this.symbol,
                undefined,
                undefined,
                (this.showAdvanced) ? this.fee : this.defaultFee
            ))
            .catch((error) => {
                console.error(error.message)
                this.alert.stopLoading()
                if (error.message == 'ERR_INSUFFICIENT_BALANCE')
                    this.alert.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
                else
                    this.alert.showError('MESSAGE.CREATE_TRANSACTION', error.message)
            })
    }

    send() {
        this.create()
            .then((result) => {
                this.navCtrl.push("confirm-tx-page", { tx: result.encode().toString('hex') })
                this.alert.stopLoading()
            })
    }

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

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
                    this.recipient_address_last_update = result[0].confirmed_at
                    this.recipientChanged()
                })
                .catch((e) => {
                    this.recipient_avatar_valid = false
                    this.recipient_address = ""
                    this.recipient_address_last_update = 0
                    this.recipientChanged()
                })
        }
    }

    updateRange() {
        this.zone.run(() => { });
    }

}
