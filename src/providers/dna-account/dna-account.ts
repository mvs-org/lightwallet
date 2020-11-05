import { Injectable } from '@angular/core';
import BigNumber from "bignumber.js";
import { DnaReqReqProvider } from '../dna-req-req/dna-req-req';
import { DnaUtilWsApiProvider } from '../dna-util-ws-api/dna-util-ws-api';
import { DnaUtilUtilProvider } from '../dna-util-util/dna-util-util';
import { Events } from 'ionic-angular';

@Injectable()
export class DnaAccountProvider {

    private initialized: boolean = false;
    private userInfo: any;
    private tokenInfo: any;
    private fullAccount: any;
    private balances: any;

    constructor(
        private event: Events,
    ) {
    }

    initialize(userInfo: any) {
        if (!this.userInfo) {
            this.userInfo = userInfo;
            this.balances = {};
        } else if (this.userInfo.name !== userInfo.name) {
            this.userInfo = userInfo;
            this.balances = {};
            this.event.publish('dna_balances_update', this.balances);
        }

        if (!this.initialized) {
            this.initialized = true;
            this.loadTokenInfo();
            this.loadFullAccount();
        }
    }

    getBalance(assetId) {
        return this.balances[assetId] ? this.balances[assetId] : null;
    }

    private loadTokenInfo() {
        DnaReqReqProvider.fetchTokenInfo()
            .then((tokenInfo) => {
                if (!tokenInfo || !tokenInfo['price_usd'] || !tokenInfo['price_cny']) {
                    return;
                }

                this.tokenInfo = tokenInfo;
                this.updateBalances();

                setTimeout(() => {
                    this.loadTokenInfo();
                }, 30 * 1000);
            })
            .catch((e) => {
                console.log('Dna token info load failed: ', e);

                setTimeout(() => {
                    this.loadTokenInfo();
                }, 1000);
            });
    }

    private loadFullAccount() {
        DnaUtilWsApiProvider.instance(false, false)
            .then((instance) => {
                return instance.db_api().exec("get_full_accounts", [[this.userInfo.name], true])
                    .then((result) => {
                        if (result && result.length > 0) {
                            let account = result.find(it => it[0] == this.userInfo.name);
                            if (account) {
                                this.fullAccount = account;
                                this.updateBalances();

                                setTimeout(() => {
                                    this.loadFullAccount();
                                }, 3 * 1000);
                            }
                        }
                    });
            })
            .catch((e) => {
                console.log('Dna full account load failed: ', e);

                setTimeout(() => {
                    this.loadFullAccount();
                }, 1000);
            });
    }

    private updateBalances() {
        if (this.tokenInfo && this.fullAccount) {
            if (this.fullAccount[1].balances && this.fullAccount[1].balances.length > 0) {
                let balances = {};
                for (let i = 0; i < this.fullAccount[1].balances.length; i ++) {
                    let coreAsset        = this.fullAccount[1].balances[i];
                    let availableBalance = coreAsset ? coreAsset.balance : 0;

                    //加上vesting_balance
                    let vestingBalances = this.fullAccount[1].vesting_balances;
                    let vestingBalance  = new BigNumber(0);
                    if (vestingBalances && vestingBalances.length > 0) {
                        for (let j = 0; j < vestingBalances.length; j++) {
                            if (vestingBalances[j].balance.asset_id == coreAsset.asset_type) {
                                vestingBalance = vestingBalance.plus(
                                    vestingBalances[j].balance.amount
                                );
                            }
                        }
                    }

                    let totalBalance = new BigNumber(availableBalance)
                        .plus(vestingBalance)
                        .toString();
                    let usdTotal = new BigNumber(this.tokenInfo['price_usd'])
                        .times(DnaUtilUtilProvider.toToken(totalBalance))
                        .toFixed(2);
                    let cnyTotal = new BigNumber(this.tokenInfo['price_cny'])
                        .times(DnaUtilUtilProvider.toToken(totalBalance))
                        .toFixed(2);

                    balances[coreAsset.asset_type] = {
                        total: totalBalance,
                        available: availableBalance,
                        frozen: vestingBalance.toString(),
                        currency: {
                            USD: usdTotal,
                            CNY: cnyTotal,
                        },
                    }
                }

                this.balances = balances;

                this.event.publish('dna_balances_update', this.balances);
            }
        }
    }
}