import { Component } from '@angular/core';
import { IonicPage, NavController, Platform, Events } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
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
    theme: string

    private syncinterval: any;

    constructor(public nav: NavController, public translate: TranslateService, private mvs: MvsServiceProvider, private alert: AlertProvider, public platform: Platform, private event: Events) {
        this.loading = true;

        //Reset last update time
        var lastupdate = new Date()
        lastupdate.setDate(0)
        this.mvs.setUpdateTime(lastupdate)

        this.theme = document.getElementById('theme').className
        this.event.subscribe("theme_changed", (theme) => {
            this.theme = ('theme-' + theme)
        });
    }

    ionViewDidEnter() {
        this.mvs.getAddresses()
            .then((addresses) => {
                if (Array.isArray(addresses) && addresses.length)
                    this.initialize()
                else
                    this.nav.setRoot("LoginPage")
            })
    }

    private loadFromCache() {
        return this.showBalances()
            .then(() => this.mvs.getHeight())
            .then((height: number) => {
                this.height = height
                return height
            })
    }

    private initialize = () => {

        this.syncinterval = setInterval(() => this.update(), 5000)

        this.mvs.getDbUpdateNeeded()
            .then((target: any) => {
                if (target)
                    return this.mvs.dataReset()
                        .then(() => this.mvs.setDbVersion(target))
                return this.loadFromCache()
            })
            .then(() => this.update())

    }

    private update = () => {
        return this.mvs.getUpdateNeeded()
            .then((update_needed) => {
                if (update_needed)
                    return this.sync().then(() => this.mvs.setUpdateTime())
            })
            .catch(() => console.log("Can't update"))
    }

    ionViewWillLeave = () => clearInterval(this.syncinterval)

    logout = () => this.alert.showLogout(() => this.mvs.hardReset()
        .then(() => this.nav.setRoot("LoginPage"))
    )

    sync(refresher = undefined) {
        //Only allow a single sync process
        if (this.syncing) {
            this.syncingSmall = false
            return Promise.resolve()
        } else {
            this.syncing = true
            this.syncingSmall = true
            return Promise.all([this.mvs.updateHeight(), this.updateBalances()])
                .then((results) => {
                    this.height = results[0]
                    this.syncing = false
                    this.syncingSmall = false
                    if (refresher)
                        refresher.complete()
                    this.offline = false
                })
                .catch((error) => {
                    console.error(error)
                    this.syncing = false

                    this.syncingSmall = false
                    if (refresher)
                        refresher.complete()
                    this.offline = true
                })
        }
    }

    private updateBalances = () => {
        return this.mvs.getData()
            .then(() => this.showBalances())
            .then(() => this.mvs.setUpdateTime())
            .catch((error) => console.error("Can't update balances: " + error))
    }

    private showBalances() {
        return this.mvs.getBalances()
            .then((_) => {
                this.balances = _
                return Promise.all(Object.keys(_.MST).map((symbol) => this.mvs.addAssetToAssetOrder(symbol)))
            })
            .then(() => this.mvs.assetOrder())
            .then((order) => {
                this.loading = false
                this.balancesKeys = order
                return order
            })
            .catch((e) => {
                console.error(e)
                console.log("Can't load balances")
            })
    }

}
