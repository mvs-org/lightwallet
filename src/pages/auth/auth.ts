import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Loading } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AppGlobals } from '../../app/app.global';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { AlertProvider } from '../../providers/alert/alert';
import { Request } from 'bitident';

@IonicPage()
@Component({
    selector: 'page-auth',
    templateUrl: 'auth.html',
})
export class AuthPage {

    loading: Loading;
    qrCodeLoaded: boolean
    message: string = ''
    isApp: boolean
    avatars: Array<string> = []
    avatars_address: any = {}
    no_avatar: boolean = false
    passphrase: string = ''
    verifiedMessage: any
    network: string

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

        this.qrCodeLoaded = false;
        this.isApp = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'));
        this.loadAvatars();
        this.network = this.globals.network

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

    validD2faMessage = (message) => (message) ? message.length > 0 : false;

    validPassword = (passphrase) => (passphrase.length > 0)

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

    async check(message) {

        this.alert.showLoading()
        try {

            let json = JSON.stringify(Request.decode(message))
            let obj = JSON.parse(json)

            if (obj.network !== this.network) {
            this.alert.showError('MESSAGE.AUTH_DIFFERENT_NETWORK', obj.network);
            } else if(obj.type != 'auth') {
                this.alert.showError('MESSAGE.AUTH_TYPE_NOT_SUPPORTED', obj.type);
            } else if (this.avatars.indexOf(obj.target) === -1) {
                this.alert.showError('MESSAGE.AUTH_UNKNOWN_AVATAR', obj.target);
            } else if((obj.time + obj.timeout) * 1000 < Date.now()) {
                this.alert.showError('MESSAGE.AUTH_TIMEOUT', '');
            } else {

                let sourceAvatar = await this.mvs.getGlobalAvatar(obj.source)

                let {sourceSignature, ...pureRequest} = obj

                this.wallet.verifyMessage(new Request(pureRequest).encode('hex'), sourceAvatar.address, sourceSignature)

                if(!this.wallet.verifyMessage(JSON.stringify(this.sortObject(pureRequest)), sourceAvatar.address, sourceSignature)) {
                    this.alert.showError('MESSAGE.AUTH_WRONG_SIGNATURE', pureRequest.source);
                } else {
                    pureRequest.hostname = new URL(pureRequest.callback).hostname
                    this.verifiedMessage = pureRequest;
                    this.leftTime = (pureRequest.time + pureRequest.timeout) - (Math.floor(Date.now())/1000)
                }
            }
        } catch (e) {
            console.error(e);
            this.alert.showError('MESSAGE.AUTH_WRONG_INCOMING_DATA', e);
        }
        
        this.alert.stopLoading()

    }

    sortObject(o: any) {
        return Object.keys(o).sort().reduce((r: any, k) => {r[k] = o[k]; return r}, {});
    }

    signAndSend(passphrase) {

        this.alert.showLoading()
        this.wallet.getWallet(passphrase)
            .then(wallet => wallet.signMessage(this.avatars_address[this.verifiedMessage.target], this.message))
            .then(signature => this.auth.confirm(this.verifiedMessage.callback, signature).toPromise())
            .then(response => {
                switch(response.status){
                    case 200:
                        this.alert.stopLoading()
                        this.navCtrl.pop()
                        this.alert.showMessage('MESSAGE.AUTH_SIGNIN_SUCCESSFUL_TITLE', 'MESSAGE.AUTH_SIGNIN_SUCCESSFUL_BODY', '')
                        return;
                    default:
                        this.alert.showError('MESSAGE.AUTH_SEND_SIG_ERROR', '')
                        return;
                }
            })
            .catch((error) => {
                this.alert.stopLoading()
                if(error.message) {
                    console.error(error.message)
                    switch(error.message){
                        case "ERR_DECRYPT_WALLET":
                            this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                            break
                        default:
                            this.alert.showError('MESSAGE.AUTH_SIGN', error.message)
                            throw Error('ERR_D2FA')
                    }
                } else {
                    console.error(error._body)
                    switch(error._body){
                        case "ERR_EXPIRED":
                            this.alert.showError('MESSAGE.AUTH_EXPIRED', '')
                            break
                        default:
                            this.alert.showError('MESSAGE.AUTH_SEND_SIG_ERROR', error.message)
                            throw Error('ERR_D2FA')
                    }
                }
            })
    }

}
