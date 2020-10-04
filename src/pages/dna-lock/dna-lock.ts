import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AlertProvider } from '../../providers/alert/alert';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DnaUtilUtilProvider } from '../../providers/dna-util-util/dna-util-util';
import { DnaUtilRegexProvider } from '../../providers/dna-util-regex/dna-util-regex';
import { TranslateService } from '@ngx-translate/core';

let DATA = require('../../data/data').default;

@IonicPage({
    name: 'dna-lock-page',
    segment: 'dna-lock'
})
@Component({
    selector: 'page-dna-lock',
    templateUrl: 'dna-lock.html',
    animations: [
        trigger('expandCollapse', [
            state('expandCollapseState', style({ height: '*' })),
            transition('* => void', [style({ height: '*' }), animate(500, style({ height: "0" }))]),
            transition('void => *', [style({ height: '0' }), animate(500, style({ height: "*" }))])
        ])
    ],
})
export class DnaLockPage {

    asset: string = DATA.TOKEN_SYMBOL;
    assetId: string = DATA.TOKEN_ASSET_ID;
    balance: any;
    userInfo: any;

    isApp: boolean;

    selectedStage: any;

    timeInterval: any;
    isLoading: boolean = true;
    password: string;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        private alert: AlertProvider,
        private translate: TranslateService,
        private storage: Storage,
    ) {
        this.isApp = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost'));
        this.storage.get('dnaUserInfo').then((userInfo) => {
            if (userInfo && userInfo.name) {
                this.userInfo = userInfo;
                this.load();
            } else {
                this.navCtrl.setRoot('LoginPage')
            }
        });
    }

    ionViewDidEnter() {

    }

    load = () => {
        this.isLoading = false;
    }

    changeStage = (e) => {
        console.log('lock stage: ', )
    }

    validPassword = (password) => {
        return password && DnaUtilRegexProvider.isPasswordLegal(password);
    }

    validAmount = (amount) => {

    }

    setAmountAll = () => {

    }

    send(password) {

    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    formatToken(val) {
        return DnaUtilUtilProvider.formatToken(val, [], 4); //
    }

    formatTokenWithoutSymbol(val) {
        return DnaUtilUtilProvider.formatToken(val, [], 4, "");
    }
}