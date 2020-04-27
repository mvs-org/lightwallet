import { Component, OnInit } from '@angular/core'
import { MetaverseService } from '../services/metaverse.service'
import { WalletService, Balances, Balance } from '../services/wallet.service'
import { DatastoreService } from '../services/datastore.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  balances: Balances
  height$ = this.metaverse.height$
  syncing: boolean

  MSTInfo = []

  base = 'USD'

  tickers

  constructor(
    private datastore: DatastoreService,
    private metaverse: MetaverseService,
    private wallet: WalletService,
  ) {
    this.wallet.balances(this.metaverse)
      .then(balanceStream => {
        balanceStream.subscribe(balances => {
          this.balances = balances
          this.MSTInfo = []
          Object.keys(balances.MST).forEach(symbol => {
            this.MSTInfo.push({
              symbol,
              icon: symbol,     //TODO add check if logo available
            })
          })
        })
      })
    this.metaverse.syncing$.subscribe((syncing) => {
      this.syncing = syncing
    })
  }

  async ngOnInit() {
    this.tickers = await this.metaverse.getTickers()
  }

  getMSTs() {
    return Object.entries(this.balances.MST)
      .map(([symbol, balance]: [string, Balance]) => ({
        symbol,
        balance,
      }))
  }

  entries = (o: object) => Object.entries(o)


}
