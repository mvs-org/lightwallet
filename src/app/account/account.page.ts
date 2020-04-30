import { Component, OnInit, OnDestroy } from '@angular/core'
import { MetaverseService } from '../services/metaverse.service'
import { WalletService, Balances, Balance } from '../services/wallet.service'
import { DatastoreService } from '../services/datastore.service';
import { CoreService } from '../services/core.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit, OnDestroy {

  balances: Balances
  height$ = this.metaverse.height$;
  syncing$ = this.datastore.core.syncing$;

  MSTInfo = []

  base = 'USD'

  tickers

  balanceSubscription: Subscription;

  constructor(
    private datastore: CoreService,
    private metaverse: MetaverseService,
  ) {
    this.height$ = this.datastore.core.height$;
    console.log('loading')
    this.balanceSubscription = this.datastore.core.balances$().subscribe(balances => {
      this.balances = balances;
      this.MSTInfo = []
      Object.keys(balances.MST).forEach(symbol => {
        this.MSTInfo.push({
          symbol,
          icon: symbol,  // TODO: add check if logo available
          balance: balances.MST[symbol]
        });
      });
    });
  }

  async ngOnInit() {
    this.tickers = await this.metaverse.getTickers()
  }

  ngOnDestroy(){
    if(this.balanceSubscription){
      this.balanceSubscription.unsubscribe();
    }
  }

}
