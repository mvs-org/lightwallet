import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AlertProvider } from '../../providers/alert/alert';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DnaUtilUtilProvider } from '../../providers/dna-util-util/dna-util-util';
import { DnaUtilRegexProvider } from '../../providers/dna-util-regex/dna-util-regex';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobals } from '../../app/app.global';
import { DnaReqWsSubscribeProvider } from '../../providers/dna-req-ws-subscribe/dna-req-ws-subscribe';
import {DnaWalletProvider} from '../../providers/dna-wallet/dna-wallet';
import {DnaReqTxProvider} from '../../providers/dna-req-tx/dna-req-tx';

let DATA = require('../../data/data').default;

@IonicPage({
    name: 'dna-lock-withdraw-page',
    segment: 'dna-lock-withdraw'
})
@Component({
    selector: 'page-dna-lock-withdraw',
    templateUrl: 'dna-lock-withdraw.html',
    animations: [
        trigger('expandCollapse', [
            state('expandCollapseState', style({ height: '*' })),
            transition('* => void', [style({ height: '*' }), animate(500, style({ height: "0" }))]),
            transition('void => *', [style({ height: '0' }), animate(500, style({ height: "*" }))])
        ])
    ],
})
export class DnaLockWithdrawPage {

    asset: string = DATA.TOKEN_SYMBOL;
    assetId: string = DATA.TOKEN_ASSET_ID;
    balance: any;
    userInfo: any;
    lock: any = this.navParams.get('lock');

    isApp: boolean;
    isLoading: boolean = true;
    password: string;

    feeLock: any;
    feeWithdraw: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        private alert: AlertProvider,
        private translate: TranslateService,
        private storage: Storage,
        private global: AppGlobals,
    ) {
        this.isApp = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost'));

        // 获取余额
        if (this.global.dnaBalances && this.global.dnaBalances[this.assetId]) {
            this.balance = this.global.dnaBalances[this.assetId];
        } else {
            this.balance = {available: 0};
        }
    }

    ionViewDidEnter() {
        console.log('withdraw lock: ', this.lock);
        this.storage.get('dnaUserInfo').then((userInfo) => {
            if (userInfo && userInfo.name) {
                this.userInfo = userInfo;
                this.load();
            } else {
                this.navCtrl.setRoot('LoginPage')
            }
        });
    }

    load = () => {
        this.loadFee()
            .then(() => this.isLoading = false)
            .catch((e) => {
                console.log('load error: ', e);
            });
    }

    loadFee = () => {
        return DnaReqWsSubscribeProvider.wsFetchOperationFees(["vesting_balance_create", "vesting_balance_withdraw"])
            .then((feeResults) => {
                if (feeResults && feeResults.length > 0) {
                    this.feeLock     = feeResults[0].fee;
                    this.feeWithdraw = feeResults[1].fee;

                    console.log('feeLock: ', this.feeLock);
                    console.log('feeWithdraw: ', this.feeWithdraw);
                }
            });
    }

    validPassword = (password) => {
        return password && DnaUtilRegexProvider.isPasswordLegal(password);
    }

    withdraw(password) {
        let mnemonic;
        try {
            mnemonic = DnaUtilUtilProvider.decryptKey(this.userInfo.key, password);
        } catch (e) {}
        if (!mnemonic) {
            return this.alert.showError('DNA.SEND_PASSWORD_ERROR', '');
        }

        this.alert.showLoading()
            .then(() => DnaUtilUtilProvider.toToken(this.lock.withdraw_available))
            .then((amount) => {
                let walletInfo = DnaWalletProvider.getAccountInfo(mnemonic, 'bts');
                return DnaReqTxProvider.withdrawCliffVestingBalance(walletInfo['privateKey'], this.userInfo.name, amount, this.lock.id).then((withdrawResult) => {
                    let txId = withdrawResult && withdrawResult['length'] > 0 ? withdrawResult[0].id : '';
                    this.translate.get(['DNA.LOCK_WITHDRAW_SUCCESS']).subscribe((translations: any) => {
                        this.alert.showMessage('MESSAGE.SUCCESS', translations['DNA.LOCK_WITHDRAW_SUCCESS'] + ' ' + txId, '')
                    });
                });
            })
            .then(() => {
                this.alert.stopLoading();
                this.navCtrl.pop();
            })
            .catch((e) => {
                console.log(e);

                this.alert.stopLoading();
                this.alert.showError('DNA.NETWORK_ERROR', '');
            });
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