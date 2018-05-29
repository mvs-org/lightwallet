import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, LoadingController, Loading } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@IonicPage()
@Component({
    selector: 'page-create-avatar',
    templateUrl: 'create-avatar.html',
})
export class CreateAvatarPage {

    symbol: string = ""
    avatar_address: string = ""
    passphrase: string = ""
    addressbalances: Array<any>
    avatars: Array<any>
    loading: Loading

    constructor(
        public navCtrl: NavController,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        private translate: TranslateService,
        private mvs: MvsServiceProvider) {

        Promise.all([this.mvs.getAddressBalances(),this.mvs.listAvatars()])
            .then((results) => {
                this.avatars=results[1]
                let addressbalances=results[0]
                let addrblncs = []
                if (Object.keys(addressbalances).length) {
                    Object.keys(addressbalances).forEach((address) => {
                        if (addressbalances[address].ETP && addressbalances[address].ETP.available>=100000000) {
                            addrblncs.push({ "address": address, "available": addressbalances[address].ETP.available })
                            this.avatars.forEach((avatar)=>{
                                if(avatar.address==address)
                                    addrblncs.pop();
                            })
                        }
                    })
                }
                this.addressbalances = addrblncs
            })
    }

    calcel() {
        this.navCtrl.pop();
    }

    create() {
        return this.showLoading()
            .then(() => this.mvs.createAvatarTx(this.passphrase, this.avatar_address, this.symbol, undefined))
            .then(tx => {
                console.log(tx)
                return tx
            })
            .then((tx) => this.mvs.broadcast(tx.encode().toString('hex'), 1000000000))
            .then((result: any) => {
                console.log(result)
                this.navCtrl.pop()
                this.translate.get('SUCCESS_SEND_TEXT').subscribe((message: string) => {
                    this.showSent(message, result.hash)
                })
            })
            .catch((error) => {
                console.error(error)
                this.loading.dismiss()
                if (error.message == 'ERR_CONNECTION')
                    this.showError('ERROR_SEND_TEXT', '')
                else if (error.message == 'ERR_BROADCAST') {
                    this.translate.get('MESSAGE.ONE_TX_PER_BLOCK').subscribe((message: string) => {
                        this.showError('MESSAGE.BROADCAST_ERROR', message)
                    })
                }
            })
    }

    validPassword = (passphrase) => (passphrase.length > 0)

    validAddress = (avatar_address) => (avatar_address != '')

    validSymbol = (symbol) => (symbol.length > 2) && (symbol.length < 64) && (!/[^A-Za-z0-9.-]/g.test(symbol))

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    ionViewDidLoad() {
        console.log('ionViewDidLoad CreateAvatarPage');
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
