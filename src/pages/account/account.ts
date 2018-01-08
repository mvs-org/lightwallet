import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@IonicPage()
@Component({
    selector: 'page-account',
    templateUrl: 'account.html'
})
export class AccountPage {

    user: string
    pass: string
    syncing = false
    syncingSmall = false
    offline = false
    balances: any
    height: number
    loading: boolean
    balancesKeys: any
    reorderable = false
    images: Array<string>
    grid: Array<Array<string>>

    private syncinterval: any;

    constructor(public nav: NavController, public translate: TranslateService, private mvs: MvsServiceProvider, private alertCtrl: AlertController, public platform: Platform) {
        this.loading = true;

        //Reset last update time
        var lastupdate = new Date()
        lastupdate.setDate(0)
        this.mvs.setUpdateTime(lastupdate)
    }

    format = (quantity, decimals) => quantity / Math.pow(10, decimals)

    ionViewDidEnter() {
        this.mvs.getMvsAddresses()
            .then((addresses) => {
                if (Array.isArray(addresses) && addresses.length)
                    this.initialize()
                else
                    this.nav.setRoot("LoginPage")
            })
    }

    initialize = () => {
        this.mvs.getLoaded()
            .then((loaded) => {
                if(loaded == true){
                    this.loadFromCache()
                } else {
                    //console.log("To load")
                }
            })
            .then(() => this.update())
            .then(() => this.syncinterval = setInterval(() => this.update(), 5000))
    }

    loadFromCache = () => {
        this.syncing = false
        this.loadBalances()
        //Update height
        this.mvs.getMvsHeight()
            .then((height: number) => {
                this.height = height
            })
    }

    update = () => {
        return this.mvs.getUpdateNeeded()
            .then((update_needed) => {
                if (update_needed)
                    return this.sync().then(()=>this.mvs.setUpdateTime())
            })
    }

    ionViewWillLeave = () => clearInterval(this.syncinterval)

    gotoDeposit = (event, asset) => this.nav.push("DepositPage")

    gotoTransactions = (event, asset) => this.nav.push("transactions-page", { asset: asset })

    gotoTransfer = (event, asset) => this.nav.push("transfer-page", { asset: asset })

    gotoReceive = (even, asset) => this.nav.push("receive-page", { asset: asset })

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
                                            this.nav.setRoot("LoginPage")
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
        if (this.syncing) {
            this.syncingSmall = false
            return Promise.resolve()
        } else {
            this.syncing = true
            this.syncingSmall = true
            return Promise.all([this.updateHeight(), this.updateBalances()])
                .then((results) => {
                    this.height = results[0]
                    this.syncing = false
                    this.syncingSmall = false
                    this.offline = false
                })
                .catch((error) => {
                    console.error(error)
                    this.syncing = false
                    this.syncingSmall = false
                    this.offline = true
                })
        }
    }

    private updateHeight = () => this.mvs.updateMvsHeight()

    private updateBalances = () => {
        //Update tx data and balances
        return this.mvs.getData()
            .then(() => this.loadBalances())
            .then(() => this.mvs.setUpdateTime())
            .then(() => this.mvs.setLoaded(true))
    }

    doRefresh(refresher) {        //Sync for mobile

        //Only allow a single sync process
        if (this.syncing)
            return Promise.resolve()
        else {
            this.syncing = true

            //Update height
            this.mvs.updateMvsHeight()
                .then((height: number) => {
                    this.height = height
                    this.offline = false
                })
                .catch((error) => {
                    console.error(error)
                    this.syncing = false
                    refresher.complete()
                    this.offline = true
                })

            //Update tx data and balances
            return this.mvs.getData()
                .then(() => this.loadBalances())
                .then(() => this.mvs.setUpdateTime())
                .then(() => {
                    this.syncing = false
                    refresher.complete()
                    this.offline = false
                })
                .catch((error) => {
                    console.error(error)
                    this.syncing = false
                    refresher.complete()
                    this.offline = true
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
