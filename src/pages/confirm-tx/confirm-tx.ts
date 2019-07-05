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
    displayedTx: any
    passphrase: string = ''
    input: string
    signedTx: string
    mode: string = 'advanced'

    constructor(
        public navCtrl: NavController,
        private mvs: MvsServiceProvider,
        private alert: AlertProvider,
        public navParams: NavParams,
    ) { }

    async ionViewDidEnter() {
        if(this.navParams.get('tx') === undefined) {
            this.navCtrl.setRoot('AccountPage')
        } else {
            //decodedTx is the tx to sign and send
            this.decodedTx = await this.mvs.decodeTx(this.navParams.get('tx'))

            //displayedTx contains more information usefull for the display
            this.displayedTx = await this.mvs.organizeDecodedTx(JSON.parse(JSON.stringify(this.decodedTx)))
        }
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    preview() {
        this.sign()
            .then((tx) => {
                console.log(tx)
                this.signedTx = tx.encode().toString('hex')
                console.log(this.signedTx)
                this.alert.stopLoading()
            })
            .catch((error) => {
                this.alert.stopLoading()
                console.error(error.message)
            })
    }

    send() {
        this.sign()
            .then((tx) => {
                //send tx
                console.log(tx)
                this.alert.stopLoading()
            })
            .catch((error) => {
                this.alert.stopLoading()
                console.error(error.message)
            })
    }

    sign() {
        return this.alert.showLoading()
            .then(() => {
                return this.mvs.sign(this.decodedTx, this.passphrase)
            })
            .catch((error) => {
                console.error(error.message)
                switch (error.message) {
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
