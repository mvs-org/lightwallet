import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { ImportWalletPage } from '../import-wallet/import-wallet';
import { LanguageSwitcherPage } from '../language-switcher/language-switcher';
import { GenerateKeyPage } from '../generate-key/generate-key';
import { ImportMnemonicPage } from '../import-mnemonic/import-mnemonic';
import { ThemeSwitcherPage } from '../theme-switcher/theme-switcher';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Storage } from '@ionic/storage';



@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})

export class LoginPage {

    fileToImport: string
    initial_mvs_key: string


    constructor(private nav: NavController, public platform: Platform, private barcodeScanner: BarcodeScanner, private storage: Storage) {
        this.nav = nav;
        this.storage.get('initial_mvs_key')
            .then((initial_mvs_key)=>{
                this.storage.get('mvs_keystore');
            })
        this.fileToImport = '{"version":"0.1.1","algo":"aes","index":10,"mnemonic":"U2FsdGVkX1/NCe34xfe7VbO/NdfbABLa+X+xg9+hNQklvaFb/BdbrVICNrqTrKkcx/Cy1XcQGh3YpdZoPF5kMRg/blm3UN02vMjSP4un3F4BciRT8c9CelBWrVkEOhcCmSH4496fOHgyyrt5mMy3FuV0m8f8jN1Tiat87mZEh+HdvJ69NG/mAS05nSMHix4EmAZRoTywa0U99H49DFqMcNr6eEY3GesnqABAzsNha3k="}';
    }



    GenerateKeyPage = e => this.nav.push(GenerateKeyPage)

    ImportMnemonicPage = e => this.nav.push(ImportMnemonicPage)

    switchLanguage = e => this.nav.push(LanguageSwitcherPage)

    switchTheme = e => this.nav.push(ThemeSwitcherPage)

    login = () => this.nav.push(ImportWalletPage)

    loginFromMobile = () => this.nav.push(ImportWalletPage)

    scanQRCode() {
        this.barcodeScanner.scan({formats: 'QR_CODE'}).then((result) => {
            // Success! Barcode data is here
            alert(
              "We got a barcode\n" +
              "Result: " + result.text + "\n" +
              "Format: " + result.format + "\n" +
              "Cancelled: " + result.cancelled
            );
            this.storage.set('mvs_keystore', result.text)
        }, (err) => {
            // An error occurred
        });
    }


}
