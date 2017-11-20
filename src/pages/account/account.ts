import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TransactionsPage } from '../transactions/transactions';
import { AssetTransferPage } from '../asset-transfer/asset-transfer';
import { ReceivePage } from '../receive/receive';
import { LoginPage } from '../login/login';

@Component({
    selector: 'page-account',
    templateUrl: 'account.html'
})
export class AccountPage {

    user: string
    pass: string
    syncing = false
    balances: any
    height: number
    loading: boolean
    balancesKeys: any
    reorderable = false
    images: Array<string>
    grid: Array<Array<string>>

    private syncinterval: any;

    constructor(public nav: NavController, public translate: TranslateService, private mvs: MvsServiceProvider, private alertCtrl: AlertController) {
        this.loading = true;
        this.sync()
    }

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    ionViewDidEnter() {
        this.syncinterval = setInterval(() => {
            this.mvs.getUpdateNeeded().then((update_needed) => {
                if (update_needed)
                    this.mvs.setUpdateTime().then(() => this.sync())
            })
        }, 20000)
    }

    ionViewWillLeave = () => clearInterval(this.syncinterval)

    gotoTransactions = (event, asset) => this.nav.push(TransactionsPage, { asset: asset })

    gotoTransfer = (event, asset) => this.nav.push(AssetTransferPage, { asset: asset })

    gotoReceive = (even, asset) => this.nav.push(ReceivePage, { asset: asset })

    errorImg = e => e.target.remove()

    /**
     * Logout dialog
     */
    logout() {
        this.translate.get('RESET_TITLE').subscribe(title => {
            this.translate.get('RESET_MESSAGE').subscribe(message => {
                this.translate.get('CONFIRM').subscribe(yes => {
                    this.translate.get('BACK').subscribe(no => {
                        let confirm = this.alertCtrl.create({
                            title: title,
                            message: message,
                            buttons: [
                                {
                                    text: no,
                                    handler: () => {
                                        console.log('Disagree clicked')
                                    }
                                },
                                {
                                    text: yes,
                                    handler: () => {
                                        this.mvs.hardReset().then(() => {
                                            confirm.dismiss()
                                            this.nav.setRoot(LoginPage)
                                            window.location.reload()
                                        })
                                    }
                                }
                            ]
                        });
                        confirm.present()
                    })
                })
            })
        })
    }

    private sync() {

        //Only allow a single sync process
        if (this.syncing)
            return Promise.resolve()
        else {
            this.syncing = true

            //Update height
            this.mvs.updateMvsHeight()
                .then((height: number) => {
                    this.height = height
                })

            //Update tx data and balances
            return this.mvs.getData()
                .then(() => this.loadBalances())
                .then(() => this.mvs.setUpdateTime())
                .then(() => {
                    this.syncing = false
                })
                .catch((error) => {
                    console.error(error)
                    this.syncing = false
                })
        }
    }

    private loadBalances() {
        return this.mvs.getBalances()
            .then((_) => {
                this.balances = _
                return Promise.all(Object.keys(_).map((asset) => this.mvs.addAssetToAssetOrder(asset)))
            })
            .then(() => this.mvs.assetOrder())
            .then((order) => {
                this.loading = false
                this.balancesKeys = order
                return order
            })
    }

}
