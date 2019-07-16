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

    hexTx: any = this.navParams.get('tx')
    decodedTx: any
    displayedTx: any
    passphrase: string = ''
    input: string
    signedTx: string
    mode: string = 'advanced'
    signStatus: string

    constructor(
        public navCtrl: NavController,
        private mvs: MvsServiceProvider,
        private alert: AlertProvider,
        public navParams: NavParams,
    ) { }

    async ionViewDidEnter() {
        if (this.navParams.get('tx') === undefined) {
            this.navCtrl.setRoot('AccountPage')
        } else {
            this.decodeAndOrganize(this.hexTx)
        }
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    async preview() {
        try {
            let tx = await this.sign()
            this.signedTx = await tx.encode().toString('hex')
            this.hexTx = this.signedTx
            this.decodeAndOrganize(this.signedTx)
            this.alert.stopLoading()
        } catch (error) {
            this.alert.stopLoading()
            console.error(error.message)
        }
    }

    async decodeAndOrganize(tx) {
        //decodedTx is the tx to sign and send
        this.decodedTx = await this.mvs.decodeTx(tx)

        //displayedTx contains more information usefull for the display
        this.displayedTx = await this.mvs.organizeTx(JSON.parse(JSON.stringify(this.decodedTx)))

        this.checkTxSignStatus(this.displayedTx)
    }

    send() {
        this.sign()
            .then(tx => this.broadcast(tx))
    }

    broadcast(tx) {
        this.mvs.send(tx)
            .then((result) => {
                this.navCtrl.setRoot('AccountPage')
                this.alert.stopLoading()
                this.alert.showSent('SUCCESS_SEND_TEXT', result.hash)
            })
            .catch((error) => {
                this.alert.stopLoading()
                console.error(error.message)
                switch(error.message){
                    case 'ERR_CONNECTION':
                        this.alert.showError('ERROR_SEND_TEXT', '')
                        break;
                    case 'ERR_SIGN_TX':
                        //already handle in create function
                        break;
                    default:
                        this.alert.showError('MESSAGE.BROADCAST_TRANSACTION', error.message)
                        throw Error('ERR_BORADCAST_TX')
                }
            })
    }

    sign() {
        return this.alert.showLoading()
            .then(() => this.mvs.sign(this.decodedTx, this.passphrase))
            .catch((error) => {
                console.error(error.message)
                switch (error.message) {
                    case 'ERR_DECRYPT_WALLET':
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        throw Error('ERR_SIGN_TX')
                    case 'ERR_DECRYPT_WALLET_FROM_SEED':
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        throw Error('ERR_SIGN_TX')
                    case 'ERR_INSUFFICIENT_BALANCE':
                        this.alert.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
                        throw Error('ERR_SIGN_TX')
                    case 'ERR_TOO_MANY_INPUTS':
                        this.alert.showErrorTranslated('ERROR_TOO_MANY_INPUTS', 'ERROR_TOO_MANY_INPUTS_TEXT')
                        throw Error('ERR_SIGN_TX')
                    default:
                        this.alert.showError('MESSAGE.SIGN_TRANSACTION', error.message)
                        throw Error('ERR_SIGN_TX')
                }
            })
    }

    checkTxSignStatus(tx) {
        let foundSignedInput = false
        let foundUnisgnedInput = false
        tx.inputs.forEach(input => {
            if(input.script) {
                foundSignedInput = true
            } else {
                foundUnisgnedInput = true
            }
        });
        if (foundSignedInput && !foundUnisgnedInput) {
            this.signStatus = 'SIGNED'
        } else if (!foundSignedInput && foundUnisgnedInput) {
            this.signStatus = 'UNSIGNED'
        } else {
            this.signStatus = 'PARTIALLY'
        }
    }

    validPassword = (passphrase) => (passphrase.length > 0)

}
