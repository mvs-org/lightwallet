import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, NavParams, AlertController, Platform, LoadingController, Loading } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@IonicPage()
@Component({
    selector: 'page-mit-transfer',
    templateUrl: 'mit-transfer.html',
})
export class MITTransferPage {

    recipient_address: string = ""
    recipient_avatar: string = ""
    passphrase: string = ""
    symbol: string
    recipient_avatar_valid: boolean = false
    loading: Loading
    etpBalance: number
    addressbalances: Array<any>
    sendFrom: string = 'auto'
    changeAddress: string = 'auto'

    constructor(
        public navCtrl: NavController,
        private alertCtrl: AlertController,
        private translate: TranslateService,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private loadingCtrl: LoadingController,
        public navParams: NavParams
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
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    send() {
        return this.showLoading()
            .then(() => this.mvs.getAddresses())
            .then((addresses) => this.mvs.createTransferMITTx(
                this.passphrase,
                "", //Sender avatar
                this.recipient_address,
                this.recipient_avatar,
                this.symbol,
                (this.sendFrom != 'auto') ? this.sendFrom : undefined,
                (this.changeAddress != 'auto') ? this.changeAddress : undefined
            ))
            .then(tx => this.mvs.send(tx))
            .then((result) => {
                this.navCtrl.pop()
                this.translate.get('SUCCESS_SEND_TEXT').subscribe((message: string) => {
                    if (this.platform.is('mobile')) {
                        this.showSentMobile(message, result.hash)
                    } else {
                        this.showSent(message, result.hash)
                    }

                })
            })
            .catch((error) => {
                console.error(error.message)
                if (error.message == "ERR_DECRYPT_WALLET")
                    this.showError('MESSAGE.PASSWORD_WRONG', '')
                else if (error.message == "ERR_INSUFFICIENT_BALANCE")
                    this.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
                else
                    this.showError('MESSAGE.CREATE_TRANSACTION', error.message)
            })
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad MitTransferPage');
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
        this.translate.get(['MESSAGE.SUCCESS', 'OK']).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['MESSAGE.SUCCESS'],
                subTitle: text + hash,
                buttons: [
                    {
                        text: translations['OK'],
                    }
                ]
            })
            alert.present(prompt)
        })
    }


    showSentMobile(text, hash) {
        this.translate.get(['MESSAGE.SUCCESS', 'OK', 'COPY']).subscribe((translations: any) => {
            let alert = this.alertCtrl.create({
                title: translations['MESSAGE.SUCCESS'],
                subTitle: text + hash,
                buttons: [
                    {
                        text: translations['OK'],
                    }
                ]
            })
            alert.present(prompt)
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
}
