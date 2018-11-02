import { Component } from '@angular/core';
import { IonicPage, NavController, Platform, Events } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

class Ticker {
    market_cap: number
    percent_change_1h: number
    percent_change_7d: number
    percent_change_24h: number
    price: number
    volume_24h: number
}

class BaseTickers {
    BTC: Ticker
    USD: Ticker
    CNY: Ticker
    EUR: Ticker
    JPY: Ticker
}

@IonicPage()
@Component({
    selector: 'page-account',
    templateUrl: 'account.html'
})
export class AccountPage {

    syncing = false
    syncingSmall = false
    offline = false
    balances: any
    height: number
    loading: boolean
    balancesKeys: any
    theme: string
    icons: any = []
    tickers = {}
    base: string
    domains: any = []
    whitelist: any = []
    saved_accounts_name: any;

    private syncinterval: any;

    constructor(public nav: NavController, public translate: TranslateService, private wallet: WalletServiceProvider, private mvs: MvsServiceProvider, private alert: AlertProvider, public platform: Platform, private event: Events) {

        this.loading = true;
        //Reset last update time
        var lastupdate = new Date()
        lastupdate.setDate(0)
        this.mvs.setUpdateTime(lastupdate)

        this.theme = document.getElementById('theme').className
        this.event.subscribe("theme_changed", (theme) => {
            this.theme = ('theme-' + theme)
        });

        this.wallet.getSavedAccounts()
            .then((accounts) => this.saved_accounts_name = accounts.map(account => account.name))

    }

    isOffline = () => !this.syncingSmall && this.offline
    isSyncing = () => this.syncingSmall

    async ionViewDidEnter() {

        if (await this.checkAccess()) {
            this.loadTickers()
            this.initialize()
            this.whitelist = await this.mvs.getWhitelist()
        }
        else
            this.nav.setRoot("LoginPage")
    }

    private async checkAccess() {
        let addresses = await this.mvs.getAddresses()
        return Array.isArray(addresses) && addresses.length
    }

    private async loadTickers() {
        this.base = await this.mvs.getBaseCurrency()
        this.mvs.getTickers()
            .then(tickers => {
                Object.keys(tickers).forEach((symbol) => {
                    let ticker: BaseTickers = tickers[symbol];
                    this.tickers[symbol] = ticker;
                })
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

        return this.mvs.getDbUpdateNeeded()
            .then((target: any) => {
                if (target)
                    return this.mvs.dataReset()
                        .then(() => this.mvs.setDbVersion(target))
                return this.loadFromCache()
            })
            .then(() => this.update())

    }

    private update = async () => {
        return (await this.mvs.getUpdateNeeded()) ? this.sync()
            .then(() => this.mvs.setUpdateTime())
            .catch(() => console.log("Can't update")) : null
    }

    ionViewWillLeave = () => clearInterval(this.syncinterval)

    logout() {
        this.alert.showLogout(this.saveAccountHandler, this.forgetAccountHandler)
    }

    newUsername(title, message, placeholder1, placeholder2) {
        this.askUsername(title, message, placeholder1, placeholder2)
            .then((info) => {
                let username = info['info1'];
                let password = info['info2'];
                if (!info || !username) {
                    this.newUsername('SAVE_ACCOUNT_TITLE_NO_NAME', 'SAVE_ACCOUNT_MESSAGE', placeholder1, placeholder2)
                } else if (this.saved_accounts_name.indexOf(username) != -1) {
                    this.newUsername('SAVE_ACCOUNT_TITLE_ALREADY_EXIST', 'SAVE_ACCOUNT_MESSAGE_ALREADY_EXIST', placeholder1, placeholder2)
                } else if (!password) {
                    this.existingUsername(username, 'SAVE_ACCOUNT_TITLE_NO_PASSWORD', 'SAVE_ACCOUNT_MESSAGE_PASSWORD', 'PASSWORD')
                } else {
                    this.saveAccount(username, password);
                }
            })
    }

    existingUsername(username, title, message, placeholder) {
        this.askPassword(title, message, placeholder)
            .then((password) => {
                if (!password) {
                    this.existingUsername(username, 'SAVE_ACCOUNT_TITLE_NO_PASSWORD', 'SAVE_ACCOUNT_MESSAGE_PASSWORD', placeholder)
                } else {
                    this.saveAccount(username, password);
                }
            })
    }

    private forgetAccountHandler = () => {
        return this.wallet.getAccountName()
            .then((account_name) => this.wallet.deleteAccount(account_name))
            .then(() => this.mvs.hardReset())
            .then(() => this.nav.setRoot("LoginPage"))
    }

    private saveAccountHandler = () => {
        return this.wallet.getAccountName()
            .then((current_username) => {
                if (current_username) {
                    this.existingUsername(current_username, 'SAVE_ACCOUNT_TITLE_PASSWORD', 'SAVE_ACCOUNT_MESSAGE_PASSWORD', 'PASSWORD');
                } else {
                    this.newUsername('SAVE_ACCOUNT_TITLE', 'SAVE_ACCOUNT_MESSAGE', 'SAVE_ACCOUNT_PLACEHOLDER', 'PASSWORD')
                }
            })
    }

    askUsername(title, message, placeholder1, placeholder2) {
        return new Promise((resolve, reject) => {
            this.translate.get([title, message, placeholder1, placeholder2]).subscribe((translations: any) => {
                this.alert.ask2Info(translations[title], translations[message], translations[placeholder1], translations[placeholder2], 'text', 'password', (info) => {
                    resolve(info)
                })
            })
        })
    }

    askPassword(title, message, placeholder) {
        return new Promise((resolve, reject) => {
            this.translate.get([title, message, placeholder]).subscribe((translations: any) => {
                this.alert.askInfo(translations[title], translations[message], translations[placeholder], 'password', (info) => {
                    resolve(info)
                })
            })
        })
    }

    saveAccount(username, password) {
        this.wallet.getWallet(password)   //test password
            .then(() => this.wallet.saveAccount(username, password))
            .then(() => this.mvs.hardReset())
            .then(() => this.nav.setRoot("LoginPage"))
            .catch((error) => {
                switch (error.message) {
                    case "ERR_DECRYPT_WALLET":
                        this.existingUsername(username, 'MESSAGE.PASSWORD_WRONG', 'SAVE_ACCOUNT_MESSAGE_PASSWORD', 'PASSWORD')
                        break;
                    default:
                        this.alert.showError('MESSAGE.ERR_SAVE_ACCOUNT', error.message)
                }
            })
    }

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

    private updateBalances = async () => {
        return this.mvs.getData()
            .then(() => {
                this.showBalances()
                return this.mvs.setUpdateTime()
            })
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
            .then((balances) => {
                let iconsList = this.wallet.getMstIcons()
                balances.map((symbol) => {
                    this.icons[symbol] = iconsList.indexOf(symbol) !== -1 ? symbol : 'default_mst'
                    this.domains[symbol] = symbol.split('.')[0]
                })
            })
            .catch((e) => {
                console.error(e)
                console.log("Can't load balances")
            })
    }

}
