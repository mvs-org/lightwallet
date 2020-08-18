import { Component, OnInit, OnDestroy } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { Subscription } from 'rxjs'
import { Router } from '@angular/router'

@Component({
  selector: 'app-mst',
  templateUrl: './mst.page.html',
  styleUrls: ['./mst.page.scss'],
})
export class MstPage implements OnInit, OnDestroy {

  balances: any
  balancesKeys: string[]
  icons: any = { MST: [], MIT: [] }
  whitelist: any = []
  tickers = {}
  base: string
  msts = []
  reorderingMsts = []
  allMsts = []
  loading = true
  loadingMoreMsts = true
  order = []

  heightSubscription: Subscription
  status = 'default'

  constructor(
    private metaverseService: MetaverseService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loadTickers()
    this.heightSubscription = this.metaverseService.height$.subscribe(() => {
      this.showBalances()
    })
    this.initGetMsts()
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
      if (this.status === 'default') {
        this.balances = await this.metaverseService.getBalances()
        await this.metaverseService.addAssetsToAssetOrder(Object.keys(this.balances.MST))
        this.order = await this.metaverseService.assetOrder()
        const hidden = await this.metaverseService.getHiddenMst()

        this.icons = await this.metaverseService.getDefaultIcon()

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
            order: this.order.indexOf(symbol)
          })
        })
        this.loading = false
      }
    } catch (e) {
      console.error(e)
      console.log('Can\'t load balances')
    }
  }

  startReordering() {
    const reorderGroup = document.getElementById('reorder') as HTMLInputElement
    reorderGroup.disabled = false
    this.status = 'edit'
    this.reorderingMsts = this.msts
  }

  reorder(event) {
    const draggedItem = this.reorderingMsts.splice(event.detail.from, 1)[0]
    this.reorderingMsts.splice(event.detail.to, 0, draggedItem)
    event.detail.complete()
  }

  async endReordering() {
    const reorderGroup = document.getElementById('reorder') as HTMLInputElement
    reorderGroup.disabled = true
    this.status = 'default'
    this.msts = this.reorderingMsts
    const order = []
    const hidden = []
    this.msts.forEach(mst => {
      order.push(mst.symbol)
      if (mst.hidden) {
        hidden.push(mst.symbol)
      }
    })
    await this.metaverseService.setAssetOrder(order)
    await this.metaverseService.setHiddenMst(hidden)
  }

  cancelReordering() {
    const reorderGroup = document.getElementById('reorder') as HTMLInputElement
    reorderGroup.disabled = true
    this.status = 'default'
  }

  errorImg = (e) => e.target.remove()

  clickMst(symbol) {
    if (this.status === 'default') {
      this.router.navigate(['/account', 'mst', symbol])
    }
  }

  async initGetMsts() {
    this.allMsts = []
    this.loadingMoreMsts = true
    const [special, msts] = await Promise.all([this.metaverseService.listSpecialMsts(), this.metaverseService.listMsts()])
    this.allMsts = special.concat(msts)
    this.loadingMoreMsts = false
  }

  async getMoreMsts() {
    this.loadingMoreMsts = true
    const lastSymbol = this.allMsts[this.allMsts.length - 1] ? this.allMsts[this.allMsts.length - 1].symbol : undefined
    const msts = await this.metaverseService.listMsts(lastSymbol)
    this.allMsts = this.allMsts.concat(msts)
    this.loadingMoreMsts = false
  }

  async addMst(mst) {
    // Add MST to current page
    const balance = {
      decimals: mst.decimals,
      available: 0,
      unconfirmed: 0,
      frozen: 0,
      total: 0,
    }
    this.msts.push({
      symbol: mst.symbol,
      balance,
      icon: this.icons.MST[mst.symbol] || 'assets/icon/default_mst.png',
      hidden: false,
      order: this.msts.length
    })

    // Add MST to order
    this.order.push(mst.symbol)
    await this.metaverseService.addAssetsToAssetOrder([mst.symbol])

    // Add MST to balances
    this.balances.MST[mst.symbol] = {
      decimals: mst.decimals,
      available: 0,
      unconfirmed: 0,
      frozen: 0,
    }
    await this.metaverseService.setBalances(this.balances)
  }

}
