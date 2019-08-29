import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Loading } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@IonicPage()
@Component({
    selector: 'page-auth',
    templateUrl: 'auth.html',
})
export class AuthPage {

    loading: Loading;
    isApp: boolean
    leftTime: number = 0;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private translate: TranslateService,
        private barcodeScanner: BarcodeScanner,
    ) {

        this.isApp = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'));

    }

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
                        this.getLastElement(result.text.toString())
                    }
                })
        })
    }

    getLastElement(token) {
        this.gotoAuthConfirm(/(\w+)$/i.exec(token)[0])
    }

    isUrl = (url) => (!/[^A-Za-z0-9@_.-]/g.test(url))

    validAuthToken = (token) => (token) ? token.length > 0 : false;

    gotoAuthConfirm = (token) => this.navCtrl.push("auth-confirm-page", { token: token })

    howToAuth = () => this.navCtrl.push("HowToAuthPage")

}
