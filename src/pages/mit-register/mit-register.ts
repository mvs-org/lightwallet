import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform, Loading } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@IonicPage()
@Component({
    selector: 'page-mit-register',
    templateUrl: 'mit-register.html',
})
export class MITRegisterPage {


    symbol: string = ""
    passphrase: string = ""
    recipient_address: string = ""
    recipient_avatar: string = ""
    content: string = ""
    loading: Loading
    addressbalances: Array<any>
    avatars: Array<any>;
    no_avatar: boolean = false;
    no_avatar_placeholder: string
    list_all_mits: Array<string> = [];
    fee: number = 10000

    constructor(
        public navCtrl: NavController,
        private alertCtrl: AlertController,
        private alert: AlertProvider,
        public platform: Platform,
        public navParams: NavParams,
        private translate: TranslateService,
        private mvs: MvsServiceProvider) {

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
    }

    ionViewDidLoad() {
        this.loadMits()
            .catch(console.error);
    }

    cancel() {
        this.navCtrl.pop();
    }

    validPassword = (passphrase) => (passphrase.length > 0)

    validSymbol = (symbol) => /^[A-Za-z0-9._\-]{3,64}$/g.test(symbol) && this.list_all_mits.indexOf(symbol) == -1

    validContent = (content) => content == undefined || content.length<253

    validName = (recipient_avatar) => (recipient_avatar !== undefined && recipient_avatar.length > 0)

    validAddress = (recipient_address) => (recipient_address !== undefined && recipient_address.length > 0)

    create() {
        return this.alert.showLoading()
            .then(() => this.mvs.createRegisterMITTx(
                this.passphrase,
                this.recipient_address,
                this.recipient_avatar,
                this.symbol,
                this.content,
                undefined,
                this.fee)
            )
            .then(tx => this.mvs.send(tx))
            .then((result) => {
                this.navCtrl.pop()
                this.translate.get('SUCCESS_SEND_TEXT').subscribe((message: string) => {
                    this.showSent(message, result.hash)
                })
            })
            .catch((error) => {
                console.error(error)
                this.loading.dismiss()
                switch (error.message) {
                    case 'ERR_CONNECTION':
                        this.alert.showError('ERROR_SEND_TEXT', '')
                        break;
                    case 'ERR_BROADCAST':
                        this.translate.get('MESSAGE.ONE_TX_PER_BLOCK').subscribe((message: string) => {
                            this.alert.showError('MESSAGE.BROADCAST_ERROR', message)
                        })
                        break;
                    case "ERR_DECRYPT_WALLET":
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        break;
                    case "ERR_INSUFFICIENT_BALANCE":
                        this.alert.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
                        break;
                    default:
                        this.alert.showError('MESSAGE.CREATE_TRANSACTION', error.message)
                }
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

    loadMits(){
        return this.mvs.getListMit()
            .then((mits) => {
                mits.result.forEach((mit) => {
                    this.list_all_mits.push(mit.attachment.symbol)
                })
            })
            .catch((error) => {
                console.error(error)
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
}
