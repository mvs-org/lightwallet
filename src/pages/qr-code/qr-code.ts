import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { trigger, state, style, animate, transition } from '@angular/animations';

@IonicPage()
@Component({
    selector: 'page-qr-code',
    templateUrl: 'qr-code.html',
    animations: [
        trigger('expandCollapse', [
            state('expandCollapseState', style({ height: '*' })),
            transition('* => void', [style({ height: '*' }), animate(500, style({ height: "0" }))]),
            transition('void => *', [style({ height: '0' }), animate(500, style({ height: "*" }))])
        ])
    ],
})
export class QRCodePage {

    qrcodeValue: string
    showAdvanced = false
    address: string
    asset: string
    base: string
    tickers = {}
    amount: string = ""
    message: string
    editable = false

    constructor(
        public nav: NavController,
        private navParams: NavParams
    ) {
        this.qrcodeValue = this.navParams.get('value')
        this.address = this.navParams.get('address')
        this.asset = this.navParams.get('asset')
        this.amount = this.navParams.get('amount')
        this.base = this.navParams.get('base')
        this.tickers = this.navParams.get('tickers')
    }

    changeQrcode() {
        if(this.showAdvanced) {
            this.qrcodeValue = 
                'mvs://app.myetpwallet.com/send/' + this.asset +
                '?r=' + this.address +
                (this.amount ? '&q=' + this.amount : '') +
                (this.message ? '&m=' + this.message : '') +
                (!this.editable ? '&d=true' : '')
        } else {
            this.qrcodeValue = this.address
        }
    }


}
