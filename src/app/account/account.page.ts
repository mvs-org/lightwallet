import { Component, OnInit } from '@angular/core';
import { MetaverseService, Balance, Balances } from '../services/metaverse.service';
import { WalletService } from '../services/wallet.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  balances: Balances;

  MSTSymbols = []

  base = 'USD';

  tickers;

  constructor(
    private metaverse: MetaverseService,
    private wallet: WalletService,
  ) {
    this.wallet.balances(this.metaverse)
      .subscribe(balances => {
        this.balances = balances;
        this.MSTSymbols = Object.keys(balances.MST);
      });
  }

  async ngOnInit() {
    this.metaverse.getData();
    this.tickers = await this.metaverse.getTickers();
  }

  getMSTs(){
    return Object.entries(this.balances.MST).map(([symbol, balance]: [string, Balance])=>({
      symbol,
      balance
    }));
  }

  entries = (o: object) => Object.entries(o);


}
