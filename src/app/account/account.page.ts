import { Component, OnInit } from '@angular/core'
import { MetaverseService} from '../services/metaverse.service'
import { WalletService, Balances, Balance } from '../services/wallet.service'

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  balances: Balances
  height$ = this.metaverse.height$
  syncing: boolean

  MSTSymbols = []

  base = 'USD'

  tickers

  constructor(
    private metaverse: MetaverseService,
    private wallet: WalletService,
  ) {
    this.wallet.balances(this.metaverse)
      .subscribe(balances => {
        this.balances = balances
        this.MSTSymbols = Object.keys(balances.MST)
      })
    this.metaverse.syncing$.subscribe((syncing) => {
      this.syncing = syncing
    })
  }

  async ngOnInit() {
    this.metaverse.sync()
    this.tickers = await this.metaverse.getTickers()
  }

  getMSTs() {
    return Object.entries(this.balances.MST).map(([symbol, balance]: [string, Balance]) => ({
      symbol,
      balance
    }))
  }

  entries = (o: object) => Object.entries(o)


}
