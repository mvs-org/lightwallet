import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-qr-code',
    templateUrl: 'qr-code.html'
})
export class QRCodePage {

    value: string;

    constructor(
        public nav: NavController,
        private navParams: NavParams
    ) {
        this.value = this.navParams.get('value')
    }


}
