import { Component, OnInit, OnDestroy } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { WalletService } from '../../services/wallet.service'
import { MetaverseService } from '../../services/metaverse.service'
import { Router } from '@angular/router'
import { AlertService } from '../../services/alert.service'
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
  tickers = {}
  base: string
  whitelist: any = []


  heightSubscription: Subscription

  constructor(
    public translate: TranslateService,
    private walletService: WalletService,
    private metaverseService: MetaverseService,
    private router: Router,
    private alertService: AlertService,
  ) { }

  async ngOnInit() {
    this.loadTickers()
    this.initialize()
    this.heightSubscription = this.metaverseService.height$.subscribe(() => {
      this.showBalances()
    })
    this.whitelist = await this.metaverseService.getWhitelist()
  }

  onDestroy() {
    if (this.heightSubscription) {
      this.heightSubscription.unsubscribe()
    }
  }

  private async loadTickers() {
    [this.base, this.tickers] = await this.metaverseService.getBaseAndTickers()
  }

  private initialize = () => {

    this.showBalances()
    this.metaverseService.getDefaultIcon()
      .then((icons) => this.icons = icons)
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
        this.balancesKeys = order
        return order
      })
      .catch((e) => {
        console.error(e)
        console.log('Can\'t load balances')
      })
  }

}
