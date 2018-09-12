import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AlertProvider } from '../../providers/alert/alert';
import { Keyboard } from '@ionic-native/keyboard';


@IonicPage()
@Component({
    selector: 'page-multisignature',
  templateUrl: 'multisignature.html',
})
export class MultisignaturePage {

    no_address: boolean = true;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private alert: AlertProvider,
        private barcodeScanner: BarcodeScanner,
        private keyboard: Keyboard,
        private translate: TranslateService
    ) {


    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    addAddress(){
        this.navCtrl.push("MultisignatureAddPage")
    }
}
