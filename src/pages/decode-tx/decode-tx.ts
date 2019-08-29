import { Component } from '@angular/core'
import { IonicPage, NavController } from 'ionic-angular'
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';

@IonicPage()
@Component({
    selector: 'page-decode-tx',
    templateUrl: 'decode-tx.html',
})

export class DecodeTxPage {

    decodedTx: any
    input: string

    constructor(
        public navCtrl: NavController,
        private mvs: MvsServiceProvider,
        private alert: AlertProvider,
        private nav: NavController,
    ) { 

    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    decode(tx) {
        this.mvs.decodeTx(tx)       //Try if the transaction can be decoded, if not, shows an error
            .then((result) => this.nav.push("confirm-tx-page", { tx: tx }))
            .catch((error) => {
                console.error(error);
                this.alert.showErrorTranslated('MESSAGE.ERROR_DECODE_TX_SUBTITLE', 'MESSAGE.ERROR_DECODE_TX_BODY')
            })
    }

    onInputChange() {
        this.input = this.input.split(/[\n ]+/).join('')
    }

}
