import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';

@IonicPage({
    name: 'confirm-tx-page',
    segment: 'confirm'
})
@Component({
    selector: 'page-confirm-tx',
    templateUrl: 'confirm-tx.html',
})

export class ConfirmTxPage {

    decodedTx: any
    passphrase: string = ''
    input: string
    signedTx: string

    constructor(
        public navCtrl: NavController,
        private mvs: MvsServiceProvider,
        private alert: AlertProvider,
        public navParams: NavParams,
    ) { }

    async ionViewDidEnter() {
        this.decodedTx = await this.mvs.organizeDecodedTx(this.navParams.get('tx'))
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    preview() {
        this.sign()
            .then((tx) => {
                this.signedTx = tx.encode().toString('hex')
                this.alert.stopLoading()
            })
            .catch((error) => {
                this.alert.stopLoading()
            })
    }

    sign() {
        return this.alert.showLoading()
            .then(() => {
                return this.mvs.sign(this.decodedTx, this.passphrase)
            })
            .catch((error) => {
                console.error(error.message)
                switch(error.message){
                    case "ERR_DECRYPT_WALLET":
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        throw Error('ERR_SIGN_TX')
                    case "ERR_INSUFFICIENT_BALANCE":
                        this.alert.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
                        throw Error('ERR_SIGN_TX')
                    case "ERR_TOO_MANY_INPUTS":
                        this.alert.showErrorTranslated('ERROR_TOO_MANY_INPUTS', 'ERROR_TOO_MANY_INPUTS_TEXT')
                        throw Error('ERR_SIGN_TX')
                    default:
                        this.alert.showError('MESSAGE.SIGN_TRANSACTION', error.message)
                        throw Error('ERR_SIGN_TX')
                }
            })
    }

    //this.alert.showSent('SUCCESS_SEND_TEXT', result.hash)

    validPassword = (passphrase) => (passphrase.length > 0)

}
