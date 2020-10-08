 import { Component } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobals } from '../../app/app.global';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { Storage } from "@ionic/storage";
import { InAppBrowser } from '@ionic-native/in-app-browser';
//import { AlertProvider } from '../../providers/alert/alert';

@IonicPage()
@Component({
    selector: 'page-apps',
    templateUrl: 'apps.html',
})
export class AppsPage {

    network: string
    loaded: boolean = false
    walletType: string;
    iab: any;
    browser: any;

    constructor(
        public nav: NavController,
        public translate: TranslateService,
        private globals: AppGlobals,
        public platform: Platform,
        private wallet: WalletServiceProvider,
        private storage: Storage,
        //private alert: AlertProvider,
    ) {
        this.network = this.globals.network
        this.iab     = new InAppBrowser();

        // 获取当前显示的钱包是 ETP 还是 DNA
        this.storage.get('walletType').then((walletType) => {
            this.walletType = walletType === 'dna' ? 'dna' : 'etp';
            this.storage.get('walletHasDna').then((walletHasDna) => {
                this.loaded = true;
                if (!walletHasDna) {
                    this.walletType = 'etp';
                }
            });
        });


    }

    ionViewDidEnter() {

    }

    EtpBridgePage = () => this.nav.push("EtpBridgePage")

    PluginSettingsPage = e => this.nav.push("PluginSettingsPage")

    MovieTicketsPage = () => this.wallet.openLink("https://movies.mvsdna.com")

    // 'toolbar=no,location=no'
    gotoDnaDapp = (url) => {
        this.browser = this.iab.create(url, '_blank');
        this.browser.on('message').subscribe((e) => {
            // https://github.com/apache/cordova-plugin-dialogs
            if (navigator['notification']) {
                navigator['notification'].prompt("\n付款账户: xo1234567890\n付款金额: 100DNA\n收款账户: nn1234567890\n交易详情: haha!!!\n\n请点击下方输入您的密码:", (e) => {

                }, '交易确认', ['Cancel', 'Ok']);
            }
        });

        this.browser.on('loadstop').subscribe((e) => {
            this.browser.executeScript({code: 'try {alert(JSON.stringify(window.webkit.messageHandlers));window.webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({x:1,y:2}));} catch(e) {alert(JSON.stringify(e.message))}'});
        });
    }

    getJavascript = () => {
        if (this.platform.is('android')) {
            return [
                '/* "value" as string. "SIG_K1_..." */',
                'function onSignDNAMessageSuccessful(id, value) {',
                '   BrigeAPI.sendResponse(id, value);',
                '}',
                '/* "value" as string. {"signatures":["SIG_K1_..."]} */',
                'function onSignDNASuccessful(id, value) {',
                '   BrigeAPI.sendResponse(id, JSON.parse(value));',
                '}',
                '/* "error" as string */',
                'function onSignDNAError(id, error) {',
                '   BrigeAPI.sendError(id, {"type": "signature_rejected", "message": error, "code": 402, "isError": true});',
                '}',
                'window.tinyBrige = {',
                '   signDNA: function (param) {',
                '       window.webkit.messageHandlers["signDNA"].postMessage(param);',
                '   },',
                '   signDNAMsg: function (param) {',
                '       window.webkit.messageHandlers["signDNAMsg"].postMessage(param);',
                '   }',
                '};',
                'TinyIdentitys.initDNA("\\(account)", "\\(publicKey)");',

            ];
        }
    }
}
