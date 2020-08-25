import { Component, OnInit, OnDestroy } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { MetaverseService } from '../../services/metaverse.service'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.page.html',
  styleUrls: ['./portfolio.page.scss'],
})
export class PortfolioPage implements OnInit, OnDestroy {

  balances: any
  balancesKeys: any
  theme: string
  icons: any = { MST: [], MIT: [] }
  tickers: any
  base: string
  whitelist: any = []
  msts = []
  loading = true
  etpBalance: any

  heightSubscription: Subscription

  constructor(
    public translate: TranslateService,
    private metaverseService: MetaverseService,
    private router: Router,
  ) { }

  async ionViewWillEnter() {
    this.loading = true
    this.heightSubscription = this.metaverseService.height$.subscribe(() => {
      this.showBalances()
    })
  }

  async ngOnInit() {
    this.loadTickers()
    this.whitelist = await this.metaverseService.getWhitelist()
  }

  ngOnDestroy() {
    if (this.heightSubscription) {
      this.heightSubscription.unsubscribe()
    }
  }

  private async loadTickers() {
    [this.base, this.tickers] = await this.metaverseService.getBaseAndTickers()
  }

  private async showBalances() {
    try {
      console.log("In show balances")
      this.balances = await this.metaverseService.getBalances()
      await this.metaverseService.addAssetsToAssetOrder(Object.keys(this.balances.MST))
      const order = await this.metaverseService.assetOrder()
      const hidden = await this.metaverseService.getHiddenMst()

      this.icons = await this.metaverseService.getDefaultIcon()

      this.etpBalance = {
        decimals: 8,
        available: this.balances.ETP.available || 0,
        unconfirmed: this.balances.ETP.unconfirmed || 0,
        frozen: this.balances.ETP.frozen || 0,
        total: 0,
      }
      this.etpBalance.total = this.etpBalance.available + this.etpBalance.unconfirmed + this.etpBalance.frozen

      this.balances.ETP.available = this.balances.ETP.available || 0
      this.balances.ETP.unconfirmed = this.balances.ETP.unconfirmed || 0
      this.balances.ETP.frozen = this.balances.ETP.frozen || 0
      this.balances.ETP.total = this.balances.ETP.available + this.balances.ETP.unconfirmed + this.balances.ETP.frozen

      this.msts = []
      Object.keys(this.balances.MST).forEach(symbol => {
        const balance = {
          decimals: this.balances.MST[symbol].decimals,
          available: this.balances.MST[symbol].available || 0,
          unconfirmed: this.balances.MST[symbol].unconfirmed || 0,
          frozen: this.balances.MST[symbol].frozen || 0,
          total: 0,
        }
        balance.total = balance.available + balance.unconfirmed + balance.frozen

        this.msts.push({
          symbol,
          balance,
          icon: this.icons.MST[symbol] || 'assets/icon/default_mst.png',
          hidden: hidden.indexOf(symbol) !== -1,
          order: order.indexOf(symbol)
        })
      })
      this.loading = false
    } catch (e) {
      console.error(e)
      console.log('Can\'t load balances')
    }
  }

  goToMst(symbol) {
    this.router.navigate(['/account', 'mst', symbol])
  }

  errorImg = (e) => e.target.remove()

}
