import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AlertProvider } from '../../providers/alert/alert';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DnaUtilUtilProvider } from '../../providers/dna-util-util/dna-util-util';
import { DnaUtilRegexProvider } from '../../providers/dna-util-regex/dna-util-regex';
import { TranslateService } from '@ngx-translate/core';
//import { AppGlobals } from '../../app/app.global';
import { DnaReqWsSubscribeProvider } from '../../providers/dna-req-ws-subscribe/dna-req-ws-subscribe';
import { DnaWalletProvider } from '../../providers/dna-wallet/dna-wallet';
import { DnaReqTxProvider } from '../../providers/dna-req-tx/dna-req-tx';
import { DnaAccountProvider } from '../../providers/dna-account/dna-account';
import BigNumber from 'bignumber.js'

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

    icons: any;
    isApp: boolean;

    display_segment: string = 'lock';

    periodList: any = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    periodAmount: any = DATA.periodAmount;
    periodUnit: string;

    selectedPeriod: any = 1;

    timeInterval: any;
    isLoading: boolean = true;
    amount: any;
    password: string;

    feeLock: any;
    feeWithdraw: any;
    currentRound: any;
    canLock: boolean;
    canWithdraw: boolean;

    locks: any;
    items_per_page: number = 5;
    page_lock: number;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        private alert: AlertProvider,
        private translate: TranslateService,
        private storage: Storage,
        //private global: AppGlobals,
        private dnaAccount: DnaAccountProvider,
    ) {
        this.icons = DATA.icons;
        this.isApp = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost'));

        this.translate.get(['DNA.LOCK_UNIT_M', 'DNA.LOCK_UNIT_D']).subscribe((transitions) => {
            if (DATA.periodText == 'm') {
                this.periodUnit = transitions['DNA.LOCK_UNIT_M'];
            } else {
                this.periodUnit = transitions['DNA.LOCK_UNIT_D'];
            }
        });
    }

    ionViewDidEnter() {
        this.storage.get('dnaUserInfo').then((userInfo) => {
            if (userInfo && userInfo.name) {
                this.userInfo = userInfo;
                this.load();

                // 获取余额
                this.balance = this.dnaAccount.getBalance(this.assetId);
                if (!this.balance) {
                    this.navCtrl.pop();
                }
            } else {
                this.navCtrl.setRoot('LoginPage')
            }
        });
    }

    load = () => {
        this.loadVestingBalances()
            .then(() => this.loadRound())
            .then(() => this.loadFee())
            .then(() => this.isLoading = false)
            .catch((e) => {
                console.log('load error: ', e);
            });
    }

    loadVestingBalances = () => {
        return DnaReqWsSubscribeProvider.wsGetVestingBalances(this.userInfo.name).then((vestingBalances) => {
            console.log('vestingBalances: ', vestingBalances);
            if (vestingBalances && vestingBalances.length > 0) {
                vestingBalances = vestingBalances.filter(
                    it => it.balance.asset_id == DATA.TOKEN_ASSET_ID
                );

                let results = [];
                let now     = new Date();
                for (let i = 0; i < vestingBalances.length; i++) {
                    let vb = vestingBalances[i];
                    let obj = {
                        id: vb.id,
                        amount: vb.balance.amount,
                        begin: null,
                        end: null,
                        seconds: 0,
                        requested_withdraw: 0,
                        balance_type: vb.balance_type
                    };
                    if (vb.policy[0] == 3) {
                        //cliff_vesting_policy_initializer
                        obj['lockTime']           = new Date(vb.policy[1].begin_timestamp + "Z");
                        obj['seconds']            = vb.policy[1].vesting_duration_seconds;
                        obj['requested_withdraw'] = vb.policy[1].requested_withdraw || 0;
                        obj['unlockTime']         = new Date(
                            obj['lockTime'].getTime() + obj.seconds * 1000
                        );
                        //obj.withdraw_available = obj.amount - obj.requested_withdraw;
                        if (obj['unlockTime'] < now) {
                            //现在已经超过解锁时间，全部解锁
                            obj['withdraw_available'] = obj.amount - obj.requested_withdraw;
                        }
                    } else if (vb.policy[0] == 2) {
                        //instant_vesting_policy_initializer
                        obj['lockTime']           = new Date();
                        obj['unlockTime']         = new Date();
                        obj['withdraw_available'] = 0;
                    } else if (vb.policy[0] == 1) {
                        //cdd_vesting_policy_initializer
                        obj['lockTime'] = new Date(
                            vb.policy[1].coin_seconds_earned_last_update + "Z"
                        );
                        obj['seconds'] = vb.policy[1].vesting_seconds;
                        //开始解锁时间
                        obj['unlockTime'] = new Date(vb.policy[1].start_claim + "Z");

                        obj['withdraw_available'] = parseInt('' + (parseFloat(this.comCsEard(vb.policy[1], vb.balance.amount)) / Math.max(vb.policy[1].vesting_seconds, 1)));
                        /*obj['withdraw_available'] = 0;
                        if (obj['unlockTime'] < now) {
                            //现在已经超过开始解锁时间
                            obj['withdraw_available'] =
                                vb.policy[1].coin_seconds_earned /
                                Math.max(vb.policy[1].vesting_seconds, 1);
                            if (obj['withdraw_available'] > obj.amount) {
                                obj['withdraw_available'] = obj.amount;
                            }
                        }*/
                    } else if (vb.policy[0] == 0) {
                        //linear_vesting_policy_initializer
                        obj['lockTime'] = new Date(vb.policy[1].begin_timestamp + "Z");
                        //vesting_cliff_seconds 超过可以提取
                        //vesting_duration_seconds 可以全部提取
                        obj['unlockTime'] = new Date(vb.policy[1].vesting_cliff_seconds + "Z");
                        if (obj['unlockTime'] < now) {
                            let endTime = new Date(vb.policy[1].vesting_duration_seconds + "Z");
                            let amount = parseFloat(vb.policy[1].begin_balance.amount);
                            if (endTime < now) {
                                obj['withdraw_available'] = amount;
                            } else {
                                let passSeconds = parseInt(
                                    '' + (now.getTime() - obj['unlockTime'].getTime() / 1000)
                                );
                                let totalSecond =
                                    vb.policy[1].vesting_duration_seconds -
                                    vb.policy[1].vesting_cliff_seconds;
                                obj['withdraw_available'] = amount * (passSeconds / totalSecond);
                            }
                        }
                    } else {

                    }

                    if (obj.amount > 0) {
                        results.push(obj);
                    }
                }

                results = results.sort((a, b) => {
                    return a.begin > b.begin ? -1 : 1;
                });

                this.locks = results;
            }
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

    comCsEard(p, amt) {
        let delta_seconds      = parseInt('' + ((new Date().getTime() - new Date(p.coin_seconds_earned_last_update + "Z").getTime()) / 1000));
        let delta_coin_seconds = new BigNumber(amt);
        delta_coin_seconds = delta_coin_seconds.times(delta_seconds);
        let coin_seconds_earned_cap = new BigNumber(amt);
        coin_seconds_earned_cap = coin_seconds_earned_cap.times(
            Math.max(p.vesting_seconds, 1)
        );

        let v1 = delta_coin_seconds.plus(p.coin_seconds_earned);
        let v2 = coin_seconds_earned_cap;
        if (v1.isGreaterThan(v2)) {
            return v2.toFixed(0);
        } else {
            return v1.toFixed(0);
        }
    }

    loadRound = () => {
        return DnaReqWsSubscribeProvider.wsFetchVotingPeriod().then((round) => {
            this.currentRound = round;
            if (round == "pre" || round == "b") {
                this.canLock = true;
            }
            if (round == "a") {
                this.canWithdraw = true;
            }
        });
    }

    changePeriod = (e) => {
        console.log('lock stage: ', this.selectedPeriod);
    }

    validPassword = (password) => {
        return password && DnaUtilRegexProvider.isPasswordLegal(password);
    }

    validAmount = (lockAmount) => {
        if (lockAmount) {
            let amount = parseFloat(lockAmount.replace(/,/g, ''));
            if (!isNaN(amount) && amount > 0) {
                return true;
            }
        }
        return false;
    }

    getUnlockTime = () => {
        let amonut = this.periodAmount * (this.selectedPeriod ? this.selectedPeriod : 1);
        if (DATA.periodText == 'm') {
            amonut = amonut * 60 * 1000;
        } else {
            amonut = amonut * 24 * 3600 * 1000;
        }

        return (new Date()).getTime() + amonut;
    }

    setAmountAll = () => {
        let amount  = this.formatTokenWithoutSymbol(this.balance.available);
        this.amount = amount.replace(/,/g, '');
    }

    lock(password) {
        if (!this.selectedPeriod) {
            return this.alert.showError('', '');
        }

        if (parseInt(DnaUtilUtilProvider.toUnit(this.amount)) > parseInt(this.balance.available)) {
            return this.alert.showError('DNA.LOCK_AMOUNT_NO_MATCH', '');
        }

        let mnemonic;
        try {
            mnemonic = DnaUtilUtilProvider.decryptKey(this.userInfo.key, password);
        } catch (e) {}
        if (!mnemonic) {
            return this.alert.showError('DNA.SEND_PASSWORD_ERROR', '');
        }

        this.alert.showLoading()
            .then(() => {
                let walletInfo = DnaWalletProvider.getAccountInfo(mnemonic, 'bts');
                return DnaReqTxProvider.createCliffVestingBalance(walletInfo['privateKey'], this.userInfo.name, parseFloat(this.amount), this.selectedPeriod)
                    .then((vestResult) => {
                        let txId = vestResult && vestResult['length'] > 0 ? vestResult[0].id : "";
                        let avai = parseInt(this.balance.available) - parseInt(this.feeLock) - parseInt(DnaUtilUtilProvider.toUnit(this.amount));

                        this.translate.get(['DNA.LOCK_SUCCESS']).subscribe((translations: any) => {
                            this.alert.showMessage('MESSAGE.SUCCESS', translations['DNA.LOCK_SUCCESS'] + ' ' + txId, '')
                        });

                        this.balance        = Object.assign({}, this.balance, {available: '' + (avai > 0 ? avai : 0)});
                        this.amount         = '';
                        this.selectedPeriod = 1;
                        this.password       = '';
                        this.load();
                    });
            })
            .then(() => {
                this.alert.stopLoading();
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

    changePage = (page_number) => {
        this.page_lock = page_number;
    }

    changeTab = (e) => {

    }

    formatToken(val) {
        return DnaUtilUtilProvider.formatToken(val, [], 4); //
    }

    formatTokenWithoutSymbol(val) {
        return DnaUtilUtilProvider.formatToken(val, [], 4, "");
    }
}