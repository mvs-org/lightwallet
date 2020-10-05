import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AlertProvider } from '../../providers/alert/alert';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DnaUtilUtilProvider } from '../../providers/dna-util-util/dna-util-util';
import { DnaUtilRegexProvider } from '../../providers/dna-util-regex/dna-util-regex';
import { DnaReqWsSubscribeProvider } from '../../providers/dna-req-ws-subscribe/dna-req-ws-subscribe';
import BigNumber from 'bignumber.js';
import { DnaReqReqProvider } from '../../providers/dna-req-req/dna-req-req';
import { TranslateService } from '@ngx-translate/core';
import {DnaWalletProvider} from '../../providers/dna-wallet/dna-wallet';
import {DnaReqTxProvider} from '../../providers/dna-req-tx/dna-req-tx';

let DATA = require('../../data/data').default;

@IonicPage({
    name: 'dna-vote-page',
    segment: 'dna-vote'
})
@Component({
    selector: 'page-dna-vote',
    templateUrl: 'dna-vote.html',
    animations: [
        trigger('expandCollapse', [
            state('expandCollapseState', style({ height: '*' })),
            transition('* => void', [style({ height: '*' }), animate(500, style({ height: "0" }))]),
            transition('void => *', [style({ height: '0' }), animate(500, style({ height: "*" }))])
        ])
    ],
})
export class DnaVotePage {

    asset: string = DATA.TOKEN_SYMBOL;
    assetId: string = DATA.TOKEN_ASSET_ID;
    balance: any = this.navParams.get('balance');
    userInfo: any;

    isApp: boolean;
    currentTime: number;
    display_segment: string = 'vote';
    electionProgressVote: number = 90;

    canVote: boolean = false;
    currentVote: any;
    nextRoundTime: any;
    currentRound: string = '';
    nodeList: any;
    selectedNode: any;
    selectedNodeSelfLock: any;
    fee: any;
    pricePerKbyte: any;

    selectedNodeIntro: string;
    selectedNodePlan: string;
    selectedNodeRatio: string;

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
        this.isApp       = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost'));
        this.currentTime = Date.now()

        this.storage.get('dnaUserInfo').then((userInfo) => {
            if (userInfo && userInfo.name) {
                this.userInfo = userInfo;
                this.load();
            } else {
                this.navCtrl.setRoot("LoginPage")
            }
        });
    }

    ionViewDidEnter() {

    }

    load = () => {
        this.loadWitness()
            .then(() => this.loadWitnessVesting())
            .then(() => this.loadWitnessInfo())
            .then(() => this.loadRound())
            .then(() => this.loadTime())
            .then(() => this.loadFee())
            .then(() => this.isLoading = false)
            .catch((e) => {
                console.log('load error: ', e);
            });
    }

    loadWitness = () => {
        return DnaReqWsSubscribeProvider.wsFetchAllWitness().then((witnesses) => {
            witnesses = witnesses.sort((a, b) => {
                return a.total_votes < b.total_votes ? 1 : -1;
            });
            this.nodeList = witnesses.filter((witness) => {
                return true;
            });

            console.log('nodeList: ', this.nodeList);

            return DnaReqWsSubscribeProvider.wsFetchBtsGetAccountDetail(this.userInfo.name).then((account) => {
                if (account && account.length > 0) {
                    let votes = account[0].options.votes;
                    if (votes.length) {
                        let voteId  = votes[0][0];
                        let current = witnesses.find(it => it.vote_id == voteId);

                        this.selectedNode = voteId;
                        this.currentVote  = current ? current.witness_account_name : '';

                        console.log('current: ', current);
                        console.log('votes: ', votes);
                        console.log('selectedNode: ', this.selectedNode);
                        console.log('currentVote', this.currentVote);
                    }
                }
            });
        });
    }

    loadWitnessVesting = () => {
        for (let i = 0; i < this.nodeList.length; i ++) {
            let node = this.nodeList[i];
            DnaReqWsSubscribeProvider.wsGetVestingBalances(node.witness_account).then((vestingBalances) => {
                vestingBalances = vestingBalances.filter(
                    it => it.balance_type == "governance" && it.policy[0] == 3
                );

                let totalLock = new BigNumber(0);
                vestingBalances.forEach((item, index) => {
                    totalLock = totalLock.plus(item.balance.amount);
                });

                node.selfLock = totalLock.toString();
                if (node.vote_id == this.selectedNode) {
                    this.selectedNodeSelfLock = node.selfLock;

                    console.log('selectedNodeSelfLock: ', this.selectedNodeSelfLock);
                }
            });
        }
    }

    loadWitnessInfo = () => {
        this.selectedNodeIntro = '';
        this.selectedNodePlan  = '';
        this.selectedNodeRatio = '';
        if (this.selectedNode) {
            let w = this.nodeList.find(it => it.vote_id == this.selectedNode);
            if (w && w.witness_account_name) {
                DnaReqReqProvider.fetchTargetNodeInfo(w.witness_account_name).then((nodeInfo) => {
                    this.selectedNodeIntro = nodeInfo ? nodeInfo['introduction'] : '';
                    this.selectedNodePlan  = nodeInfo ? nodeInfo['plan'] : '';
                });
            }
            if (w) {
                this.selectedNodeSelfLock = w.selfLock;

                let currentRatio = w.block_producer_reward_pct / 100;
                let nextRatio    = w.next_block_producer_reward_pct / 100;
                this.translate.get(['DNA.VOTE_CURRENT_RATIO', 'DNA.VOTE_NEXT_RATIO']).subscribe((translations) => {
                    let ratio = translations['DNA.VOTE_CURRENT_RATIO'] + ' ' + currentRatio.toFixed(2) + '%';
                    if (nextRatio != currentRatio) {
                        ratio +=
                            '   ' + translations['DNA.VOTE_NEXT_RATIO'] + ' ' + nextRatio.toFixed(2) + '%';
                    }

                    this.selectedNodeRatio = ratio;
                });
            }
        }
    }

    loadRound = () => {
        return DnaReqWsSubscribeProvider.wsFetchVotingPeriod().then((round) => {
            this.currentRound = round;

            console.log('currentRound: ', this.currentRound);
            if (this.currentRound === 'pre' || this.currentRound === 'a') {
                this.canVote = true;
                console.log('canVote', this.canVote);
            }
        });
    }

    loadTime = () => {
        return DnaReqWsSubscribeProvider.wsFetchGlobalProperites().then((properties) => {
            if (properties && properties.next_era_start_time) {
                this.nextRoundTime = new Date(properties.next_era_start_time + "Z");
                clearInterval(this.timeInterval);
                this.timeInterval = setInterval(() => {
                    if (this.nextRoundTime && new Date() >= this.nextRoundTime) {
                        clearInterval(this.timeInterval);
                        this.load();
                    }
                }, 10000);
            }
        });
    }

    loadFee = () => {
        return DnaReqWsSubscribeProvider.wsFetchOperationFees(['account_update']).then((feeResults) => {
            if (feeResults.length > 0) {
                this.fee           = feeResults[0].fee;
                this.pricePerKbyte = feeResults[0].price_per_kbyte;
            }
        });
    }

    formatTokenWithoutSymbol(val) {
        return DnaUtilUtilProvider.formatToken(val, [], 4, "");
    }

    validPassword = (password) => {
        return password && DnaUtilRegexProvider.isPasswordLegal(password);
    }

    send(password) {
        if (!this.selectedNode) {
            return this.alert.showError('DNA.VOTE_NODE_SELECT', '');
        }

        let node = this.nodeList.find((node) => {
            return node.vote_id == this.selectedNode;
        });
        if (!node) {
            return this.translate.get('DNA.VOTE_NODE_MIN_LOCK', {m: DATA.witnessMinLocked}).subscribe((translations) => {
                this.alert.showError(translations, '');
            });
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
                // BTS网络下，查询该ID对应信息
                let walletInfo = DnaWalletProvider.getAccountInfo(mnemonic, 'bts');
                let voteList   = this.nodeList.filter(
                    it => it.vote_id == this.selectedNode
                );
                return DnaReqTxProvider.voteForWitness(walletInfo['privateKey'], this.userInfo['name'], voteList, '')
                    .then((voteResult) => {
                        let txId = voteResult && voteResult['length'] > 0 ? voteResult[0].id : '';

                        this.translate.get(['DNA.VOTE_SUCCESS']).subscribe((translations: any) => {
                            this.alert.showMessage('MESSAGE.SUCCESS', translations['DNA.VOTE_SUCCESS'] + ' ' + txId, '')
                        });

                        this.password = '';
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

    changeNode() {
        this.loadWitnessInfo();
    }

    isShow(node) {
        return node.selfLock && (new BigNumber(DATA.witnessMinLocked)).isLessThan(new BigNumber(node.selfLock));
    }

    hasSelfLock(node) {
        return typeof node.selfLock != 'undefined';
    }

    formatToken(val) {
        return DnaUtilUtilProvider.formatToken(val, [], 4); //
    }
}