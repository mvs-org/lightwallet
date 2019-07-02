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

    constructor(
        public navCtrl: NavController,
        private mvs: MvsServiceProvider,
        private alert: AlertProvider,
        public navParams: NavParams,
    ) {
        this.decodedTx = navParams.get('tx')
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    sign() {

    }

    validPassword = (passphrase) => (passphrase.length > 0)

}
