import { Component, Input, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Loading, Select } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AppGlobals } from '../../app/app.global';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { AlertProvider } from '../../providers/alert/alert';
import { Request, Message } from 'bitident';

@IonicPage({
    name: 'auth-confirm-page',
    segment: 'auth-confirm/:token'
})
@Component({
    selector: 'page-auth-confirm',
    templateUrl: 'auth-confirm.html',
})
export class AuthConfirmPage {

    @Input() token: string = '';

    loading: Loading;
    avatars: Array<string> = []
    avatars_address: any = {}
    verifiedToken: any
    sourceSignature: string
    hostname: string

    leftTime: number = 0;

    @ViewChild('selectAvatar') selectAvatar: Select;

    constructor(
        public navCtrl: NavController,
        private globals: AppGlobals,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        private wallet: WalletServiceProvider,
        private auth: AuthServiceProvider,
        private alert: AlertProvider,
    ) {

    }

    ionViewDidEnter() {
        this.loadAvatars()
            .then(() => this.check(this.navParams.get('token')))
    }

    cancel() {
        this.navCtrl.setRoot("AccountPage")
    }

    loadAvatars(){
        return this.mvs.listAvatars()
            .then((avatars) => {
                if(avatars.length === 0) {
                    this.alert.showMessage('MESSAGE.AUTH_NO_AVATAR_TITLE', '', 'MESSAGE.AUTH_NO_AVATAR_TITLE_BODY')
                } else {
                    return avatars.forEach(avatar => {
                        this.avatars_address[avatar.symbol] = avatar.address
                        this.avatars.push(avatar.symbol)
                    });
                }
            })
    }

    validPassword = (passphrase) => passphrase && passphrase.length > 0

    async check(token) {

        this.alert.showLoading()
        try {

            const signedToken = Request.decode(token)

            this.sourceSignature = signedToken.sourceSignature

            if (signedToken.version > 1) {
                this.navCtrl.pop()
                this.alert.showError('MESSAGE.AUTH_HIGHER_VERSION', 'version ' + signedToken.version);    
            } else if(signedToken.network !== this.globals.network) {
                this.navCtrl.pop()
                this.alert.showError('MESSAGE.AUTH_DIFFERENT_NETWORK', signedToken.network);
            } else if(signedToken.type != 'auth') {
                this.navCtrl.pop()
                this.alert.showError('MESSAGE.AUTH_TYPE_NOT_SUPPORTED', signedToken.type);
            } else if((signedToken.time + signedToken.timeout) * 1000 < Date.now()) {
                this.navCtrl.pop()
                this.alert.showError('MESSAGE.AUTH_TIMEOUT', '');
            } else if (signedToken.target && this.avatars.indexOf(signedToken.target) === -1) {
                this.navCtrl.pop()
                this.alert.showError('MESSAGE.AUTH_UNKNOWN_AVATAR', signedToken.target);
            } else {

                signedToken.sourceSignature = ''
                const encodedUnsignedToken = signedToken.encode('hex')

                const sourceAvatar = await this.mvs.getGlobalAvatar(signedToken.source)

                const sourceAddress = sourceAvatar.address

                if(this.sourceSignature && !Message.verify(encodedUnsignedToken, sourceAddress, Buffer.from(this.sourceSignature, 'hex'), signedToken.source)) {
                    this.navCtrl.pop()
                    this.alert.showError('MESSAGE.AUTH_WRONG_SIGNATURE', signedToken.source);
                } else {
                    this.hostname = new URL(signedToken.callback).hostname
                    this.verifiedToken = signedToken;
                    this.leftTime = (signedToken.time + signedToken.timeout) - (Math.floor(Date.now())/1000)
                    if (!this.verifiedToken.target)
                        setTimeout(() => this.selectAvatar.open(), 100)
                }
            }
        } catch (e) {
            console.error(e);
            this.navCtrl.pop()
            this.alert.showError('MESSAGE.AUTH_WRONG_INCOMING_DATA', e);
        }
        this.alert.stopLoading()

    }

    signAndSend(passphrase) {

        this.alert.showLoading()
        this.wallet.getWallet(passphrase)
            .then(wallet => wallet.findDeriveNodeByAddess(this.avatars_address[this.verifiedToken.target], 200))
            .then(node => {
                let tokenToSign = this.verifiedToken.encode('hex')
                return Message.signPK(tokenToSign, node.keyPair.d.toBuffer(32), node.keyPair.compressed, this.verifiedToken.target)
            })
            .then(signature => {
                let result = this.verifiedToken
                result.targetSignature = signature.toString('hex')
                result.sourceSignature = this.sourceSignature
                result = result.encode('hex')
                return this.auth.confirm(this.verifiedToken.callback, result).toPromise()
            })
            .then(response => {
                this.alert.stopLoading()
                this.navCtrl.setRoot("AccountPage")
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
                            this.alert.showError('MESSAGE.AUTH_SEND_SIG_ERROR','')
                            break
                        case "ERR_INVALID_SIGNATURE":
                            this.alert.showError('MESSAGE.AUTH_SEND_INVALID_SIGNATURE','')
                            break
                        default:
                            this.alert.showError('MESSAGE.AUTH_SIGN', error.message)
                            throw Error('ERR_AUTH')
                    }
                }
            })
    }

    onAvatarSelectChange = (avatar) => {
        this.verifiedToken.target = avatar
    }

}
