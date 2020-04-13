import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Loading } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AppGlobals } from '../../app/app.global';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { AlertProvider } from '../../providers/alert/alert';

@IonicPage()
@Component({
    selector: 'page-import-wallet-mobile',
    templateUrl: 'import-wallet-mobile.html',
})
export class ImportWalletMobilePage {

    loading: Loading;
    qrCodeLoaded: boolean
    seed: string
    xpub: string
    index: number

    constructor(
        public nav: NavController,
        private globals: AppGlobals,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        private wallet: WalletServiceProvider,
        private translate: TranslateService,
        private barcodeScanner: BarcodeScanner,
        private alert: AlertProvider,
    ) {
        this.qrCodeLoaded = false;
    }

    passwordValid = (password) => (password) ? password.length > 0 : false;

    scan() {
        this.alert.showLoading()
            .then(() => {
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
                                let content = result.text.toString().split('&')
                                this.seed = content[0]
                                let network = content[1]
                                this.index = Math.max(5, Math.min(parseInt(content[2]), 50))
                                let xpub = content[3]
                                if (content.length < 3 || content.length > 4) {
                                    this.alert.stopLoading()
                                    this.alert.showError('IMPORT_QRCODE', '')
                                } else {
                                    this.globals.getNetwork()
                                        .then((currentNetwork) => {
                                            if (network != currentNetwork.charAt(0)) {
                                                this.alert.stopLoading()
                                                this.alert.showError('MESSAGE.NETWORK_MISMATCH', '')
                                            } else {
                                                if (this.seed) {
                                                    this.wallet.setMobileWallet(this.seed).then(() => this.qrCodeLoaded = true)
                                                    this.alert.stopLoading()
                                                } else if (xpub) {
                                                    this.wallet.getWalletFromMasterPublicKey(xpub)
                                                        .then((wallet) => this.wallet.generateAddresses(wallet, 0, this.index))
                                                        .then((addresses) => this.mvs.addAddresses(addresses))
                                                        .then(() => this.wallet.setXpub(xpub))
                                                        .then(() => this.nav.setRoot("LoadingPage", { reset: true }))
                                                        .then(() => this.alert.stopLoading())
                                                } else {
                                                    this.alert.stopLoading()
                                                    this.alert.showError('IMPORT_QRCODE', '')
                                                }
                                            }
                                        })
                                }
                            } else {
                                this.alert.stopLoading()
                            }
                        })
                })
            })
    }

    decrypt(password, seed) {
        this.alert.showLoading()
        this.wallet.setMobileWallet(seed)
            .then(() => this.wallet.getMasterPublicKey(password))
            .then((xpub) => this.wallet.setXpub(xpub))
            .then(() => Promise.all([this.wallet.getWallet(password)]))
            .then(([wallet]) => this.wallet.generateAddresses(wallet, 0, this.index))
            .then((addresses) => this.mvs.setAddresses(addresses))
            .then(() => this.wallet.saveSessionAccount(password))
            .then(() => this.nav.setRoot("LoadingPage", { reset: true }))
            .catch((e) => {
                console.error(e);
                this.alert.showError('MESSAGE.PASSWORD_WRONG', '');
                this.alert.stopLoading()
            });
    }

    howToMobile = () => this.nav.push("HowToMobilePage")

}
