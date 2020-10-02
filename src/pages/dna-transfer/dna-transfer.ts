import { Component/*, ViewChild, NgZone*/ } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AlertProvider } from '../../providers/alert/alert';
//import { Keyboard } from '@ionic-native/keyboard';
import {DnaUtilRegexProvider} from "../../providers/dna-util-regex/dna-util-regex";
import {DnaUtilUtilProvider} from "../../providers/dna-util-util/dna-util-util";
import {DnaReqWsSubscribeProvider} from "../../providers/dna-req-ws-subscribe/dna-req-ws-subscribe";
import {DnaWalletProvider} from "../../providers/dna-wallet/dna-wallet";
import {DnaReqTxProvider} from "../../providers/dna-req-tx/dna-req-tx";
import BigNumber from "bignumber.js";

@IonicPage({
    name: 'dna-transfer-page',
    segment: 'dna-send/:asset'
})
@Component({
    selector: 'page-dna-transfer',
    templateUrl: 'dna-transfer.html',
})
export class DnaTransferPage {

    asset: string = this.navParams.get('asset');
    balance: any = this.navParams.get('balance');
    userInfo: any = this.navParams.get('userInfo');

    depositAddress: string;
    sendAmount: string;
    memo: string;
    password: string;
    serviceFee: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        private alert: AlertProvider,
        private barcodeScanner: BarcodeScanner,
        //private keyboard: Keyboard,
        private translate: TranslateService,
    ) {
        if (!this.balance || !this.userInfo) {
            this.navCtrl.setRoot('DnaAccountPage');
        }
    }


    ionViewDidEnter() {
        DnaReqWsSubscribeProvider.wsFetchOperationFees(["transfer"]).then((feeResults) => {
            if (feeResults && feeResults.length > 0) {
                this.serviceFee = {
                    fee: feeResults[0].fee,
                    pricePerKbyte: feeResults[0].price_per_kbyte,
                };
            }
        });
    }

    formatTokenWithoutSymbol(val) {
        return DnaUtilUtilProvider.formatToken(val, [], 4, "");
    }

    validDepositAddress = (depositAddress) => {
        return depositAddress && DnaUtilRegexProvider.isBtsNameLegal(depositAddress);
    }

    validSendAmount = (sendAmount) => {
        if (sendAmount) {
            let amount = parseFloat(sendAmount.replace(',', ''));
            if (!isNaN(amount) && amount > 0) {
                return true;
            }
        }
        return false;
    }

    validPassword = (password) => {
        return password && DnaUtilRegexProvider.isPasswordLegal(password);
    }

    setAmountAll = () => {
        let amount = this.formatTokenWithoutSymbol(this.balance.available);
        this.sendAmount = amount.replace(',', '');
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    send() {
        this.alert.showLoading()
            .then(() => {
                // 不能发送给自己
                if (this.depositAddress === this.userInfo.name) {
                    throw 'DNA.SEND_CAN_NOT_YOURSELF';
                }
            })
            .then(() => DnaReqWsSubscribeProvider.wsFetchBtsGetAccountDetail(this.depositAddress))
            .then((result) => {
                // 检查收款地址是否存在
                if (!result || !result.length || !result[0]) {
                    throw 'DNA.SEND_DEPOSIT_ADDRESS_NOT_EXISTS';
                }
            }).then(() => {
                // 检查余额是否充足
                let amount = DnaUtilUtilProvider.toUnit(this.sendAmount);
                if (amount > this.balance.available) {
                    throw 'DNA.SEND_AVAILABLE_NOT_ENOUGH';
                }
                if (new BigNumber(this.balance.available).isLessThan(new BigNumber(amount))) {
                    throw 'DNA.SEND_AVAILABLE_NOT_ENOUGH';
                }
            }).then(() => {
                // 检查备注是否包含密码
                if (this.memo && this.memo.toLowerCase() === this.password.toLowerCase()) {
                    throw 'DNA.SEND_MEMO_CONTAIN_PASSWORD';
                }
            })
            .then(() => {
                let mnemonic: string = '';
                try {
                    mnemonic = DnaUtilUtilProvider.decryptKey(this.userInfo.key, this.password);
                    if (!mnemonic) {
                        throw 'DNA.SEND_PASSWORD_ERROR';
                    }
                } catch (e) {
                    throw 'DNA.SEND_PASSWORD_ERROR';
                }


                let walletInfo = DnaWalletProvider.getAccountInfo(mnemonic, 'bts');

                // TODO 现在是直接转账，是否要加确认？
                return DnaReqTxProvider.transferDNA(walletInfo['privateKey'], this.userInfo.name, this.depositAddress, {amount: DnaUtilUtilProvider.toUnit(this.sendAmount), asset: this.asset}, this.memo, true)
                    .then((result) => {
                        if (!result || !result.operations || !result.operations[0] || !result.operations[0][1] || !result.operations[0][1].fee) {
                            throw 'DNA.NETWORK_ERROR';
                        }

                        let feeObj = result.operations[0][1].fee;
                        return DnaReqTxProvider.transferDNA(walletInfo['privateKey'], this.userInfo.name, this.depositAddress, {amount: DnaUtilUtilProvider.toUnit(this.sendAmount), asset: this.asset}, this.memo, false)
                            .then((result) => {
                                let txId = (result && result.length > 0) ? result[0].id : '';

                                this.balance            = Object.assign({}, this.balance, {available: this.balance.available - parseInt(DnaUtilUtilProvider.toUnit(this.sendAmount).toString()) - feeObj['amount']});
                                this.depositAddress     = '';
                                this.sendAmount         = '';
                                this.memo               = '';
                                this.password           = '';

                                this.alert.stopLoading();
                                this.translate.get(['DNA.SEND_SUCCESS']).subscribe((translations: any) => {
                                    this.alert.showMessage('MESSAGE.SUCCESS', translations['DNA.SEND_SUCCESS'] + ' ' + txId, '')
                                });
                            });
                    });
            })
            .catch((e) => {
                if (typeof e === 'string' && e.substr(0, 3) === 'DNA') {
                    this.alert.showError(e, '');
                } else {

                }

                console.log(e);
                this.alert.stopLoading();
            });
    }

    scan() {
        this.translate.get(['SCANNING.MESSAGE_ADDRESS']).subscribe((translations: any) => {
            this.barcodeScanner.scan(
                {
                    preferFrontCamera: false,
                    showFlipCameraButton: false,
                    showTorchButton: false,
                    torchOn: false,
                    prompt: translations['SCANNING.MESSAGE_ADDRESS'],
                    resultDisplayDuration: 0,
                    formats: "QR_CODE",
                }).then((result) => {
                    if (!result.cancelled) {
                        const codeContent = result.text.toString();
                        if (DnaUtilRegexProvider.isBtsNameLegal(codeContent)) {
                            this.depositAddress = codeContent;
                        }
                    }
                }).catch((e) => {
                    console.log('Barcode scan error: ', e);
                });
        })
    }

}
