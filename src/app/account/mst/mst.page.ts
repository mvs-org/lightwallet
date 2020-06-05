import { Component, OnInit } from '@angular/core';
import { MetaverseService } from 'src/app/services/metaverse.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mst',
  templateUrl: './mst.page.html',
  styleUrls: ['./mst.page.scss'],
})
export class MstPage implements OnInit {

  balances: any
  balancesKeys: string[]
  icons: any = { MST: [], MIT: [] }
  whitelist: any = []
  tickers = {}
  base: string

  constructor(
    private metaverseService: MetaverseService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.showBalances()
    this.loadTickers()
  }

  private async loadTickers() {
    [this.base, this.tickers] = await this.metaverseService.getBaseAndTickers()
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
      .then(() => this.metaverseService.getDefaultIcon())
      .then((icons) => this.icons = icons)
      .catch((e) => {
        console.error(e)
        console.log('Can\'t load balances')
      })
  }

  reorder = () => this.router.navigate(['/account', 'mst', 'reorder'])
}
