import { Component } from '@angular/core'
import { IonicPage, NavController } from 'ionic-angular'
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';

@IonicPage()
@Component({
    selector: 'page-confirm-tx',
    templateUrl: 'confirm-tx.html',
})

export class ConfirmTxPage {

    decodedTx: any
    passphrase: string = ''
    input: string

    constructor(
        public navCtrl: NavController,
        private mvs: MvsServiceProvider,
        private alert: AlertProvider,
    ) { }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    decode(tx) {
        this.mvs.decodeTx(tx)
            .then((result) => this.decodedTx = result)
            .catch((error) => {
                console.error(error);
                this.alert.showErrorTranslated('MESSAGE.ERROR_DECODE_TX_SUBTITLE', 'MESSAGE.ERROR_DECODE_TX_BODY')
            })
    }

    sign() {

    }

    validPassword = (passphrase) => (passphrase.length > 0)

    onInputChange() {
        this.input = this.input.split(/[\n ]+/).join('')
    }

}
