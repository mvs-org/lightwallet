import { Component } from '@angular/core';
import { IonicPage, NavController, Platform, Events, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { DnaReqWsSubscribeProvider } from "../../providers/dna-req-ws-subscribe/dna-req-ws-subscribe";
import { DnaReqReqProvider } from "../../providers/dna-req-req/dna-req-req";
import BigNumber from "bignumber.js";
import { DnaUtilUtilProvider } from "../../providers/dna-util-util/dna-util-util";
import { AppGlobals } from '../../app/app.global';

let DATA = require('../../data/data.js').default;

@IonicPage()
@Component({
    selector: 'page-dna-account',
    templateUrl: 'dna-account.html'
})
export class DnaAccountPage {

    syncing = false
    syncingSmall = false
    offline = false

    height: number
    loading: boolean
    theme: string
    //icons: any = { MST: [], MIT: [] }
    //tickers = {}
    //base: string
    //domains: any = []
    //whitelist: any = []
    saved_accounts_name: any = []

    hasSeed: boolean = true

    dnaAssetId:string = DATA.TOKEN_ASSET_ID;
    language:string;
    userInfo:any;
    userData:any = {};
    balances:any = {};

    mstAssets: any;
    mstAssetsAll: any;
    mitAssets: any;

    private initialized = false;
    private syncinterval: any;

    constructor(
        public nav: NavController,
        public translate: TranslateService,
        private wallet: WalletServiceProvider,
        private mvs: MvsServiceProvider,
        private alert: AlertProvider,
        public platform: Platform,
        private event: Events,
        public navParams: NavParams,
        private storage: Storage,
        private global: AppGlobals,
    ) {

        this.loading = true;
        this.storage.get('dnaBlockHeight').then((blockHeight) => {
            this.height = blockHeight;
        });

        this.theme = document.getElementById('theme').className
        this.event.subscribe("theme_changed", (theme) => {
            this.theme = ('theme-' + theme)
        });

        this.initBalance(this.dnaAssetId);

        //this.storage.remove('saved_dna_assets');
    }

    isOffline = () => !this.syncingSmall && this.offline
    isSyncing = () => this.syncingSmall

    async ionViewDidEnter() {
        if (await this.checkAccess()) {
            this.initialize();
            this.loadMstAssets();
        }
        else
            this.nav.setRoot("LoginPage")
    }

    private async checkAccess() {
        this.userInfo = await this.storage.get('dnaUserInfo');
        return this.userInfo && (this.userInfo.name || this.userInfo.address);
    }

    private initialize = () => {
        if (!this.initialized) {
            if (!this.userInfo.key) {
                this.hasSeed = false;
            }

            DnaReqWsSubscribeProvider.subscribeAccountBalance(
                this.userInfo.name,
                (balances) => this.handleBalance(balances),
                (vestingBalances) => this.handleVestingBalance(vestingBalances),
                (fullAccount) => this.handleFullAccount(fullAccount)
            );
        } else {
            this.syncinterval = setTimeout(() => {
                this.refreshTokenInfo();
            }, 500);
        }

        this.initialized = true;
    }

    async loadMstAssets() {
        let assetsAll   = this.mstAssetsAll ? this.mstAssetsAll : await DnaReqWsSubscribeProvider.wsListAssets();
        let assetsSaved = await this.storage.get('saved_dna_assets');
        if (assetsSaved && assetsSaved.order && assetsSaved.hidden) {
            let assetsMst = [];
            for (let i = 0; i < assetsSaved.order.length; i ++) {
                for (let j = 0; j < assetsAll.length; j ++) {
                    if (assetsSaved.order[i] == assetsAll[j].symbol && assetsSaved.hidden.indexOf(assetsAll[j].symbol) <= -1) {
                        if (assetsAll[j].id != this.dnaAssetId) {
                            assetsMst.push(assetsAll[j]);
                            this.initBalance(assetsAll[j].id);
                        }
                    }
                }
            }
            this.mstAssets = assetsMst;
        } else {
            let assetsMst = [];
            for (let i = 0; i < assetsAll.length; i ++) {
                if (assetsAll[i].id != this.dnaAssetId) {
                    assetsMst.push(assetsAll[i]);
                    this.initBalance(assetsAll[i].id);
                }
            }
            this.mstAssets = assetsMst;
        }

        this.mstAssetsAll = assetsAll;
    }

    handleBalance(balances) {
        if (balances) {
            this.userData['balances'] = [balances];
            this.refreshTokenInfo();
        }
    }

    handleVestingBalance(vestingBalances) {
        this.userData['vestingBalances'] = vestingBalances;
    }

    handleFullAccount(fullAccount) {
        this.userData['selectedNode'] = "";
        if (fullAccount.votes && fullAccount.votes.length && fullAccount.votes[0].length) {
            this.userData['selectedNode'] = fullAccount.votes[0][0];
        }
    }

    refreshTokenInfo() {
        // 刷新高度
        DnaReqWsSubscribeProvider.subscribeLatestBlock((res) => {
            this.height = res.head_block_number;
        });

        // 刷新余额
        DnaReqReqProvider.fetchTokenInfo()
            .then((tokenInfo) => {
                if (!tokenInfo || !tokenInfo['price_usd'] || !tokenInfo['price_cny']) {
                    return;
                }

                console.log('DnaUserData:', this.userData);
                console.log('DnaReqReqProvider.fetchTokenInfo: ', tokenInfo, this.userData);

                let balances  = this.userData['balances'] || [];
                for (var i = 0; i < balances.length; i ++) {
                    let coreAsset        = balances[i];
                    let availableBalance = coreAsset ? coreAsset.balance : 0;

                    //加上vesting_balance
                    let vestingBalances = this.userData['vestingBalances'] || [];
                    let vestingBalance  = new BigNumber(0);
                    for (let i = 0; i < vestingBalances.length; i++) {
                        if (vestingBalances[i].balance.asset_id == coreAsset.asset_type) {
                            vestingBalance = vestingBalance.plus(
                                vestingBalances[i].balance.amount
                            );
                        }
                    }

                    let totalBalance = new BigNumber(availableBalance)
                        .plus(vestingBalance)
                        .toString();
                    let usdTotal = new BigNumber(tokenInfo['price_usd'])
                        .times(DnaUtilUtilProvider.toToken(totalBalance))
                        .toFixed(2);
                    let cnyTotal = new BigNumber(tokenInfo['price_cny'])
                        .times(DnaUtilUtilProvider.toToken(totalBalance))
                        .toFixed(2);

                    this.balances[coreAsset.asset_type] = {
                        total: totalBalance,
                        available: availableBalance,
                        frozen: vestingBalance.toString(),
                        currency: {
                            USD: usdTotal,
                            CNY: cnyTotal,
                        },
                    }

                    // 存为全局变量
                    this.global.dnaBalances = this.balances;
                }

                this.loading = false;
                this.storage.get('language').then((language) => this.language = language);

                clearTimeout(this.syncinterval);
                this.syncinterval = setTimeout(() => {
                    this.refreshTokenInfo();
                }, 3 * 1000);
            })
    }

    ionViewWillLeave = () => {
        clearTimeout(this.syncinterval);
    }

    logout() {
        this.wallet.getSessionAccountInfo()
            .then((account_info) => {
                if(account_info || !this.hasSeed) {
                    this.alert.showLogout(this.saveAccountHandler, this.forgetAccountHandler)
                } else {
                    this.alert.showLogoutNoAccount(() => this.mvs.hardReset()
                        .then(() => this.nav.setRoot("LoginPage")))
                }
            })
    }

    newUsername(title, message, placeholder) {
        this.askUsername(title, message, placeholder)
            .then((username) => {
                if (!username) {
                    this.newUsername('SAVE_ACCOUNT_TITLE_NO_NAME', 'SAVE_ACCOUNT_MESSAGE', placeholder)
                } else if (this.saved_accounts_name.indexOf(username) != -1) {
                    this.newUsername('SAVE_ACCOUNT_TITLE_ALREADY_EXIST', 'SAVE_ACCOUNT_MESSAGE_ALREADY_EXIST', placeholder)
                } else {
                    this.saveAccount(username);
                }
            })
    }

    private initBalance(assetId) {
        if (!this.balances[assetId]) {
            this.balances[assetId] = {
                total: 0,
                available: 0,
                frozen: 0,
            }
        }
    }

    private forgetAccountHandler = () => {
        return this.wallet.getAccountName()
            .then((account_name) => {
                return this.wallet.deleteAccount(account_name)
                    // 删除 DNA 账户信息
                    .then(() => this.storage.get('saved_dna_accounts'))
                    .then((savedDnaAccounts) => {
                        if (savedDnaAccounts && savedDnaAccounts.length > 0) {
                            savedDnaAccounts.find((o, i) => {
                                if (o.name === account_name) {
                                    savedDnaAccounts.splice(i, 1);
                                    return true;
                                }
                            });

                            return this.storage.set('saved_dna_accounts', savedDnaAccounts);
                        }
                    });
            })
            .then(() => this.mvs.hardReset())
            .then(() => this.nav.setRoot("LoginPage"))
    }

    private saveAccountHandler = () => {
        return this.wallet.getAccountName()
            .then((current_username) => {
                if (current_username) {
                    this.saveAccount(current_username);
                } else {
                    this.newUsername('SAVE_ACCOUNT_TITLE', 'SAVE_ACCOUNT_MESSAGE', 'SAVE_ACCOUNT_PLACEHOLDER')
                }
            })
    }

    askUsername(title, message, placeholder) {
        return new Promise((resolve, reject) => {
            this.translate.get([title, message, placeholder]).subscribe((translations: any) => {
                this.alert.askInfo(translations[title], translations[message], translations[placeholder], 'text', (info) => {
                    resolve(info)
                })
            })
        })
    }

    saveAccount(username) {
        this.wallet.saveAccount(username)
            .then(() => this.storage.get('dnaUserInfo'))
            .then((dnaUserInfo) => {
                if (dnaUserInfo) {
                    return this.storage.get('saved_dna_accounts')
                        .then((savedDnaAccounts) => {
                            if (!savedDnaAccounts) {
                                savedDnaAccounts = [];
                            }
                            return this.storage.get('walletType').then((walletType) => {
                                walletType = walletType === 'dna' ? 'dna' : 'etp';

                                let index = -1;
                                savedDnaAccounts.find((o, i) => {
                                    if (o && o.name === username) {
                                        index = i;
                                        return true; // stop searching
                                    }
                                });

                                let saved = {
                                    name: username,
                                    walletType: walletType,
                                    dnaUserInfo: dnaUserInfo,
                                }

                                if (index >= 0) {
                                    savedDnaAccounts[index] = saved;
                                } else {
                                    savedDnaAccounts.push(saved);
                                }

                                return this.storage.set('saved_dna_accounts', savedDnaAccounts);
                            });
                        });
                }
            })
            .then(() => this.mvs.hardReset())
            .then(() => this.nav.setRoot("LoginPage"))
            .catch((error) => {
                this.alert.showError('MESSAGE.ERR_SAVE_ACCOUNT', error.message)
            })
    }

    sync(refresher = undefined) {
        //Only allow a single sync process
        if (this.syncing) {
            this.syncingSmall = false
            return Promise.resolve()
        } else {
            this.syncing = false
            this.syncingSmall = false
        }

        setTimeout(() => {
            if (refresher)
                refresher.complete()
        }, 1000);
    }

    reorder = () => this.nav.push("DnaReorderPage")

}
