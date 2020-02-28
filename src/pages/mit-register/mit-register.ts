import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Loading } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AppGlobals } from '../../app/app.global';

@IonicPage()
@Component({
    selector: 'page-mit-register',
    templateUrl: 'mit-register.html',
})
export class MITRegisterPage {


    symbol: string = ""
    recipient_address: string = ""
    recipient_avatar: string = ""
    content: string = ""
    loading: Loading
    addressbalances: Array<any>
    avatars: Array<any>;
    no_avatar: boolean = false;
    no_avatar_placeholder: string
    defaultFee: number
    fee: number
    symbol_available: boolean = false
    showAdvanced: boolean = false

    constructor(
        public navCtrl: NavController,
        private alert: AlertProvider,
        public platform: Platform,
        public navParams: NavParams,
        private translate: TranslateService,
        private mvs: MvsServiceProvider,
        private zone: NgZone,
        private globals: AppGlobals,
    ) {

        this.recipient_avatar = this.navParams.get('avatar_name')
        this.recipient_address = this.navParams.get('avatar_address')
        if(!this.recipient_address) {
            this.translate.get('MIT_REGISTER.SELECT_AVATAR').subscribe((message: string) => {
                this.recipient_address = message
            })
        }
        this.translate.get('ISSUE.NO_AVATAR_PLACEHOLDER').subscribe((message: string) => {
            this.no_avatar_placeholder = message
        })

        Promise.all([this.mvs.getAddressBalances(), this.mvs.listAvatars()])
            .then((results) => {
                this.avatars = results[1]
                if(this.avatars.length === 0) {
                    this.no_avatar = true;
                }
                let addressbalances = results[0]
                let addrblncs = []
                if (Object.keys(addressbalances).length) {
                    Object.keys(addressbalances).forEach((address) => {
                        if (addressbalances[address].ETP && addressbalances[address].ETP.available >= 10000) {
                            addrblncs.push({ "address": address, "available": addressbalances[address].ETP.available })
                            this.avatars.forEach((avatar) => {
                                if (avatar.address == address)
                                    addrblncs.pop();
                            })
                        }
                    })
                }
                this.addressbalances = addrblncs
            })

        this.fee = this.globals.default_fees.mitIssue
        this.defaultFee = this.fee
        this.mvs.getFees()
            .then(fees => {
                this.fee = fees.mitIssue
                this.defaultFee = this.fee
            })

    }

    cancel() {
        this.navCtrl.pop();
    }

    validSymbol = (symbol) => /^[A-Za-z0-9._\-]{3,64}$/g.test(symbol) && this.symbol_available

    validContent = (content) => content == undefined || content.length<253

    validName = (recipient_avatar) => (recipient_avatar !== undefined && recipient_avatar.length > 0)

    validAddress = (recipient_address) => (recipient_address !== undefined && recipient_address.length > 0)

    create() {
        return this.alert.showLoading()
            .then(() => this.mvs.createRegisterMITTx(
                this.recipient_address,
                this.recipient_avatar,
                this.symbol,
                this.content,
                undefined,
                (this.showAdvanced) ? this.fee : this.defaultFee)
            )
            .catch((error) => {
                console.error(error)
                this.alert.stopLoading()
                switch (error.message) {
                    case 'ERR_CONNECTION':
                        this.alert.showError('ERROR_SEND_TEXT', '')
                        break;
                    case 'ERR_BROADCAST':
                        this.translate.get('MESSAGE.ONE_TX_PER_BLOCK').subscribe((message: string) => {
                            this.alert.showError('MESSAGE.BROADCAST_ERROR', message)
                        })
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
            .then((result) => {
                this.navCtrl.push("confirm-tx-page", { tx: result.encode().toString('hex') })
                this.alert.stopLoading()
            })
    }

    avatarChanged = () => {
        this.avatars.forEach((avatar) => {
            if(avatar.symbol == this.recipient_avatar) {
                this.recipient_address = avatar.address
                return
            }
        })
    }

    symbolChanged = () => {
        if (this.symbol && this.symbol.length >= 3) {
            this.symbol = this.symbol.trim()
            Promise.all([this.mvs.suggestMIT(this.symbol), this.symbol])
                .then(result => {
                    if (this.symbol != result[1]) {
                        throw ''
                    } else if (result[0][0] === this.symbol) {
                        this.symbol_available = false
                    } else {
                        this.symbol_available = true
                    }
                })
                .catch((e) => {
                    this.symbol_available = false
                })
        }
    }

    updateRange() {
        this.zone.run(() => { });
    }

}
