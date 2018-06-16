import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform, LoadingController, Loading } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
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
    avatars: Array<any>

    constructor(
        public navCtrl: NavController,
        private alertCtrl: AlertController,
        public platform: Platform,
        public navParams: NavParams,
        private loadingCtrl: LoadingController,
        private translate: TranslateService,
        private mvs: MvsServiceProvider) {

        this.recipient_avatar = this.navParams.get('avatar_name')
        this.recipient_address = this.navParams.get('avatar_address')

        Promise.all([this.mvs.getAddressBalances(), this.mvs.listAvatars()])
            .then((results) => {
                this.avatars = results[1]
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

    cancel() {
        this.navCtrl.pop();
    }

    validPassword = (passphrase) => (passphrase.length > 0)

    validSymbol = (symbol) => /^[A-Za-z0-9._\-]{3,64}$/g.test(symbol)

    validContent = (content) => content.length<253

    create() {
        return this.showLoading()
            .then(() => this.mvs.createRegisterMITTx(this.passphrase, this.recipient_address, this.recipient_avatar, this.symbol, this.content, undefined))
            .then(tx => this.mvs.send(tx))
            .then((result) => {
                this.navCtrl.pop()
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
                console.error(error)
                this.loading.dismiss()
                if (error.message == 'ERR_CONNECTION')
                    this.showError('ERROR_SEND_TEXT', '')
                else {
                    this.showError('MESSAGE.BROADCAST_ERROR', error.message)
                }
            })
    }

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
}
