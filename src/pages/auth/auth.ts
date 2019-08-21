import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Loading } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AppGlobals } from '../../app/app.global';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { AlertProvider } from '../../providers/alert/alert';
import { Request, Message } from 'bitident';

@IonicPage()
@Component({
    selector: 'page-auth',
    templateUrl: 'auth.html',
})
export class AuthPage {

    loading: Loading;
    token: string = ''
    isApp: boolean
    avatars: Array<string> = []
    avatars_address: any = {}
    verifiedToken: any

    leftTime: number = 0;

    constructor(
        public navCtrl: NavController,
        private globals: AppGlobals,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        private wallet: WalletServiceProvider,
        private translate: TranslateService,
        private barcodeScanner: BarcodeScanner,
        private auth: AuthServiceProvider,
        private alert: AlertProvider,
    ) {

        this.isApp = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'));
        this.loadAvatars();

    }

    cancel() {
        this.navCtrl.pop();
    }

    loadAvatars(){
        return this.mvs.listAvatars()
            .then((avatars) => {
                if(avatars.length === 0) {
                    this.alert.showMessage('MESSAGE.AUTH_NO_AVATAR_TITLE', '', 'MESSAGE.AUTH_NO_AVATAR_TITLE_BODY')
                } else {
                    avatars.forEach(avatar => {
                        this.avatars_address[avatar.symbol] = avatar.address
                        this.avatars.push(avatar.symbol)
                    });
                }
            })
    }

    validAuthToken = (token) => (token) ? token.length > 0 : false;

    validPassword = (passphrase) => passphrase && passphrase.length > 0

    scan() {
        this.translate.get(['SCANNING.AUTH_MESSAGE']).subscribe((translations: any) => {
            this.barcodeScanner.scan(
                {
                    preferFrontCamera: false, // iOS and Android
                    showFlipCameraButton: false, // iOS and Android
                    showTorchButton: false, // iOS and Android
                    torchOn: false, // Android, launch with the torch switched on (if available)
                    prompt: translations['SCANNING.AUTH_MESSAGE'], // Android
                    resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                    formats: "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
                }).then((result) => {
                    if (!result.cancelled) {
                        this.check(result.text.toString())
                    }
                })
        })
    }

    async check(token) {

        this.alert.showLoading()
        try {

            const signedToken = Request.decode(token)

            const sourceSignature = signedToken.sourceSignature

            if (signedToken.network !== this.globals.network) {
                this.alert.showError('MESSAGE.AUTH_DIFFERENT_NETWORK', signedToken.network);
            } else if(signedToken.type != 'auth') {
                this.alert.showError('MESSAGE.AUTH_TYPE_NOT_SUPPORTED', signedToken.type);
            } else if (this.avatars.indexOf(signedToken.target) === -1) {
                this.alert.showError('MESSAGE.AUTH_UNKNOWN_AVATAR', signedToken.target);
            } else if((signedToken.time + signedToken.timeout) * 1000 < Date.now()) {
                this.alert.showError('MESSAGE.AUTH_TIMEOUT', '');
            } else {

                signedToken.sourceSignature = ''
                const encodedUnsignedToken = signedToken.encode('hex')

                const sourceAvatar = await this.mvs.getGlobalAvatar(signedToken.source)

                const sourceAddress = sourceAvatar.address

                const valid = Message.verify(encodedUnsignedToken, sourceAddress, sourceSignature, signedToken.source)

                if(!valid) {
                    this.alert.showError('MESSAGE.AUTH_WRONG_SIGNATURE', signedToken.source);
                } else {
                    signedToken.hostname = new URL(signedToken.callback).hostname
                    this.verifiedToken = signedToken;
                    this.leftTime = (signedToken.time + signedToken.timeout) - (Math.floor(Date.now())/1000)
                }
            }
        } catch (e) {
            console.error(e);
            this.alert.showError('MESSAGE.AUTH_WRONG_INCOMING_DATA', e);
        }
        this.alert.stopLoading()

    }

    signAndSend(token, passphrase) {

        this.alert.showLoading()
        this.wallet.getWallet(passphrase)
            .then(wallet => wallet.findDeriveNodeByAddess(this.avatars_address[this.verifiedToken.target], 200))
            .then(node => Message.signPK(token, node.keyPair.d.toBuffer(32), node.keyPair.compressed, this.verifiedToken.target))
            .then(signature => this.auth.confirm(this.verifiedToken.callback, signature).toPromise())
            .then(response => {
                this.alert.stopLoading()
                this.navCtrl.pop()
                this.alert.showMessage('MESSAGE.AUTH_SIGNIN_SUCCESSFUL_TITLE', 'MESSAGE.AUTH_SIGNIN_SUCCESSFUL_BODY', '')
            })
            .catch((error) => {
                this.alert.stopLoading()
                if(error.message) { //internal error
                    console.error(error.message)
                    switch(error.message){
                        case "ERR_DECRYPT_WALLET":
                            this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                            break
                        case "AUTH_EXPIRED":
                            this.alert.showError('MESSAGE.AUTH_EXPIRED', '')
                            break
                        case "ERR_AUTH":
                            this.alert.showError('MESSAGE.AUTH_SEND_SIG_ERROR', error.message)
                            break
                        default:
                            this.alert.showError('MESSAGE.AUTH_SIGN', error.message)
                            throw Error('ERR_AUTH')
                    }
                }
            })
    }

}
