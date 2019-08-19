import { Component, OnInit, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AppGlobals } from '../../app/app.global';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { D2faServiceProvider } from '../../providers/d2fa-service/d2fa-service';
import { AlertProvider } from '../../providers/alert/alert';
//import { CountdownComponent } from 'ngx-countdown';

@IonicPage()
@Component({
    selector: 'page-d2fa-scan',
    templateUrl: 'd2fa-scan.html',
})
export class D2faScanPage implements OnInit, OnDestroy{

    loading: Loading;
    qrCodeLoaded: boolean
    message: string = ''
    isApp: boolean
    avatars: Array<string> = []
    avatars_address: any = {}
    no_avatar: boolean = false
    passphrase: string = ''
    verifiedMessage: any
    currentTime: number

    remainingTime: number
    checkInterval: any;
    //@ViewChild(CountdownComponent) counter: CountdownComponent;

    constructor(
        public navCtrl: NavController,
        private globals: AppGlobals,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        private wallet: WalletServiceProvider,
        private alertCtrl: AlertController,
        private translate: TranslateService,
        private barcodeScanner: BarcodeScanner,
        private loadingCtrl: LoadingController,
        private d2fa: D2faServiceProvider,
        private zone: NgZone,
        private alert: AlertProvider,
    ) {

        this.qrCodeLoaded = false;
        this.isApp = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'));
        this.loadAvatars();

        this.currentTime = Math.floor(Date.now());
        
    }

    ngOnInit(){
        
    }
    
    clearInterval(){
        if(this.checkInterval){
            clearInterval(this.checkInterval)
        }
    }

    ngOnDestroy(){
        this.clearInterval()
    }

    cancel() {
        this.navCtrl.pop();
    }

    loadAvatars(){
        return this.mvs.listAvatars()
            .then((avatars) => {
                if(avatars.length === 0) {
                    this.alert.showMessage('MESSAGE.D2FA_NO_AVATAR_TITLE', '', 'MESSAGE.D2FA_NO_AVATAR_TITLE_BODY')
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
        let wallet = {};
        this.translate.get(['SCANNING.MESSAGE_ACCOUNT']).subscribe((translations: any) => {
            this.barcodeScanner.scan(
                {
                    preferFrontCamera: false, // iOS and Android
                    showFlipCameraButton: false, // iOS and Android
                    showTorchButton: false, // iOS and Android
                    torchOn: false, // Android, launch with the torch switched on (if available)
                    prompt: translations['SCANNING.MESSAGE_ACCOUNT'], // Android
                    resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                    formats: "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
                }).then((result) => {
                    if (!result.cancelled) {
                        console.log(result.text.toString())
                        let content = result.text.toString().split('&')
                        if (content.length != 3) {
                            this.alert.showError('IMPORT_QRCODE', '')
                        } else {
                            this.globals.getNetwork()
                                .then((network) => {
                                    if (content[1] != network.charAt(0)) {
                                        this.alert.showError('MESSAGE.NETWORK_MISMATCH', '')
                                    } else {
                                        wallet = { "index": Math.max(5, Math.min(parseInt(content[2]), 50)) }
                                        this.wallet.setWallet(wallet)
                                        this.wallet.setMobileWallet(content[0]).then(() => this.qrCodeLoaded = true)
                                    }
                                })
                        }
                    }
                })
        })
    }

    decrypt(password, seed) {
        this.alert.showLoading()
        this.wallet.setMobileWallet(seed)
            .then(() => Promise.all([this.wallet.getWallet(password), this.wallet.getAddressIndex()]))
            .then((results) => this.wallet.generateAddresses(results[0], 0, results[1]))
            .then((addresses) => this.mvs.setAddresses(addresses))
            .then(() => this.wallet.saveSessionAccount(password))
            .then(() => this.navCtrl.setRoot("LoadingPage", { reset: true }))
            .catch((e) => {
                console.error(e);
                this.alert.showError('MESSAGE.PASSWORD_WRONG', '');
            });
    }

    async check(message) {

        this.alert.showLoading()
        let obj = JSON.parse(message)

        console.log(obj)

        this.clearInterval()

        if(obj.type != 'd2fa') {
            this.alert.showError('MESSAGE.D2FA_TYPE_NOT_SUPPORTED', obj.type);
        } else if (this.avatars.indexOf(obj.target) === -1) {
            this.alert.showError('MESSAGE.D2FA_UNKNOWN_AVATAR', obj.target);
        //} else if((obj.time + obj.timeout) * 1000 < Date.now()) {
         //   this.alert.showError('MESSAGE.D2FA_TIMEOUT', '');
        } else {
            try {
                let sig = obj.signature
                delete obj.signature

                let sourceAvatar = await this.mvs.getGlobalAvatar(obj.source)

                if(!this.wallet.verifyMessage(JSON.stringify(this.sortObject(obj)), sourceAvatar.address, sig)) {
                    this.alert.showError('MESSAGE.D2FA_WRONG_SIGNATURE', obj.source);
                } else {
                    obj.hostname = new URL(obj.callback).hostname
                    this.verifiedMessage = obj;
                    const timeoutTime = obj.time + obj.timeout
                    /*this.zone.run(()=>{
                        this.checkInterval = setInterval(function(){
                            const currentTime = Math.floor(Date.now())
                            this.remainingTime = (timeoutTime)*1000 - currentTime
                            console.log(currentTime, this.remainingTime)
                        }, 1000);
                    })*/
                }
            } catch (e) {
                console.error(e);
                this.alert.showError('MESSAGE.D2FA_WRONG_INCOMING_DATA', e);
            }
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
            .then(signature => this.d2fa.confirm(this.verifiedMessage.callback, signature).toPromise())
            .then(response => {
                switch(response.status){
                    case 200:
                        this.alert.stopLoading()
                        this.navCtrl.pop()
                        this.alert.showMessage('MESSAGE.D2FA_SIGNIN_SUCCESSFUL_TITLE', 'MESSAGE.D2FA_SIGNIN_SUCCESSFUL_BODY', '')
                        return;
                    default:
                        this.alert.showError('MESSAGE.D2FA_SEND_SIG_ERROR', '')
                        return;
                }
            })
            .catch((error) => {
                console.error(error.message)
                this.alert.stopLoading()
                switch(error.message){
                    case "ERR_DECRYPT_WALLET":
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        break
                    default:
                        this.alert.showError('MESSAGE.D2FA_SIGN', error.message)
                        throw Error('ERR_D2FA')
                }
            })
    }

    howToMobile = () => this.navCtrl.push("HowToMobilePage")

}
