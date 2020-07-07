import { Component, OnInit, OnDestroy } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { Subscription } from 'rxjs'

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
  loading = true

  heightSubscription: Subscription
  status = 'default'

  constructor(
    private metaverseService: MetaverseService,
  ) { }

  ngOnInit() {
    this.loadTickers()
    this.heightSubscription = this.metaverseService.height$.subscribe(() => {
      this.showBalances()
    })
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
        const order = await this.metaverseService.assetOrder()
        const hidden = await this.metaverseService.getHiddenMst()

        this.icons = await this.metaverseService.getDefaultIcon()

        this.msts = [
          /*{
            symbol: 'ETP',
            icon: 'assets/icon/ETP.png',
            balance: this.balances.ETP
          }*/
        ]
        Object.keys(this.balances.MST).forEach(symbol => {
          this.msts.push({
            symbol,
            icon: this.icons.MST[symbol] || 'assets/icon/default_mst.png',
            balance: this.balances.MST[symbol],
            hidden: hidden.indexOf(symbol) !== -1,
            order: order.indexOf(symbol)
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

}
