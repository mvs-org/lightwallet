import { Component, OnInit } from '@angular/core'
import { NavController, Platform, } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { WalletService } from '../services/wallet.service'
import { MetaverseService } from '../services/metaverse.service'
import { AlertController } from '@ionic/angular'
import { Router } from '@angular/router'
import { AlertService } from '../services/alert.service'

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  syncing = false
  syncingSmall = false
  offline = false
  balances: any
  height: number
  loading: boolean
  balancesKeys: any
  theme: string
  icons: any = { MST: [], MIT: [] }
  tickers = {}
  base: string
  domains: any = []
  whitelist: any = []
  saved_accounts_name: any = []
  hasSeed: boolean

  private syncinterval: any

  constructor(
    public translate: TranslateService,
    private walletService: WalletService,
    private metaverseService: MetaverseService,
    public platform: Platform,
    private router: Router,
    private alertService: AlertService,
  ) {

    this.loading = true
    // Reset last update time
    let lastupdate = new Date()
    this.metaverseService.setUpdateTime(lastupdate)

    // this.theme = document.getElementById('theme').className

    this.walletService.getSavedAccounts()
      .then((accounts) => this.saved_accounts_name = (accounts && accounts.length >= 1) ? accounts.map(account => account.name) : [])

    this.walletService.hasSeed()
      .then((hasSeed) => this.hasSeed = hasSeed)

  }

  ngOnInit(){

  }

  isOffline = () => !this.syncingSmall && this.offline
  isSyncing = () => this.syncingSmall

  async ionViewDidEnter() {

    if (await this.checkAccess()) {
      this.loadTickers()
      this.initialize()
      try {
        this.whitelist = await this.metaverseService.getWhitelist()
      } catch (e) {
        console.error(e)
      }

    }
    else {
      this.router.navigate(['/'])
    }

    this.metaverseService.updateFees()
  }

  private async checkAccess() {
    const addresses = await this.metaverseService.getAddresses()
    return Array.isArray(addresses) && addresses.length
  }

  private async loadTickers() {
    [this.base, this.tickers] = await this.metaverseService.getBaseAndTickers()

  }

  private loadFromCache() {
    return this.showBalances()
      .then(() => this.metaverseService.getHeight())
      .then((height: number) => {
        this.height = height
        return height
      })
  }

  private initialize = () => {

    this.syncinterval = setInterval(() => this.update(), 5000)

    return this.metaverseService.getDbUpdateNeeded()
      .then((target: any) => {
        if (target) {
          this.router.navigate(['/loading'])
        }
        return this.loadFromCache()
      })
      .then(() => this.update())
      .then(() => this.metaverseService.getDefaultIcon())
      .then((icons) => this.icons = icons)
  }

  private update = async () => {
    return (await this.metaverseService.getUpdateNeeded()) ? this.sync()
      .then(() => this.metaverseService.setUpdateTime())
      .catch(() => console.log('Can\'t update')) : null
  }

  ionViewWillLeave = () => clearInterval(this.syncinterval)

  logout() {
    this.walletService.getSessionAccountInfo()
      .then((account_info) => {
        if (account_info || !this.hasSeed) {
          this.alertService.showLogout(this.saveAccountHandler, this.forgetAccountHandler)
        } else {
          this.alertService.showLogoutNoAccount(() => this.metaverseService.hardReset()
           .then(() => this.router.navigate(['/'])))
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
          this.saveAccount(username)
        }
      })
  }

  private forgetAccountHandler = () => {
    return this.walletService.getAccountName()
      .then((account_name) => this.walletService.deleteAccount(account_name))
      .then(() => this.metaverseService.hardReset())
      .then(() => this.router.navigate(['/']))
  }

  private saveAccountHandler = () => {
    return this.walletService.getAccountName()
      .then((current_username) => {
        if (current_username) {
          this.saveAccount(current_username)
        } else {
          this.newUsername('SAVE_ACCOUNT_TITLE', 'SAVE_ACCOUNT_MESSAGE', 'SAVE_ACCOUNT_PLACEHOLDER')
        }
      })
  }

  askUsername(title, message, placeholder) {
    return new Promise((resolve, reject) => {
      this.translate.get([title, message, placeholder]).subscribe((translations: any) => {
        this.alertService.askInfo(translations[title], translations[message], translations[placeholder], 'text', (info) => {
          resolve(info)
        })
      })
    })
  }

  saveAccount(username) {
    this.walletService.saveAccount(username)
      .then(() => this.metaverseService.hardReset())
      .then(() => this.router.navigate(['/']))
      .catch((error) => {
        // this.alert.showError('MESSAGE.ERR_SAVE_ACCOUNT', error.message)
      })
  }

  sync(refresher = undefined) {
    // Only allow a single sync process
    if (this.syncing) {
      this.syncingSmall = false
      return Promise.resolve()
    } else {
      this.syncing = true
      this.syncingSmall = true
      return Promise.all([this.metaverseService.updateHeight(), this.updateBalances()])
        .then(([height, balances]) => {
          this.height = height
          this.syncing = false
          this.syncingSmall = false
          if (refresher) {
            refresher.complete()
          }
          this.offline = false
        })
        .catch((error) => {
          console.error(error)
          this.syncing = false

          this.syncingSmall = false
          if (refresher) {
            refresher.complete()
          }
          this.offline = true
        })
    }
  }

  private updateBalances = async () => {
    return this.metaverseService.getData()
      .then(() => {
        this.showBalances()
        return this.metaverseService.setUpdateTime()
      })
      .catch((error) => console.error('Can\'t update balances: ' + error))
  }

  private showBalances() {
    return this.metaverseService.getBalances()
      .then((_) => {
        this.balances = _
        return this.metaverseService.addAssetsToAssetOrder(Object.keys(_.MST))
      })
      .then(() => Promise.all([this.metaverseService.assetOrder(), this.metaverseService.getHiddenMst()]))
      .then(([all, hidden]) => {
        const order = []
        all.forEach(symbol => {
          if (hidden.indexOf(symbol) === -1) {
            order.push(symbol)
          }
        })
        this.loading = false
        this.balancesKeys = order
        return order
      })
      .catch((e) => {
        console.error(e)
        console.log('Can\'t load balances')
      })
  }

  reorder = () => this.router.navigate(['/account', 'reorder'])
}
