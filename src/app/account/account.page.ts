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
  icons = {}

  base = 'USD'

  tickers

  balanceSubscription: Subscription;

  constructor(
    private datastore: CoreService,
    private metaverse: MetaverseService,
    private wallet: WalletService,
  ) {
    this.height$ = this.datastore.core.height$;
    console.log('loading')
  }

  async ngOnInit() {
    this.tickers = await this.metaverse.getTickers()
    let icons = await this.wallet.getIcons()
    console.log(icons)

    this.balanceSubscription = this.datastore.core.balances$().subscribe(balances => {
      this.balances = balances;
      this.MSTInfo = [
        {
          symbol: 'ETP',
          icon: 'ETP',
          balance: balances.ETP
        }
      ]
      Object.keys(balances.MST).forEach(symbol => {
        this.MSTInfo.push({
          symbol,
          icon: icons.MST.indexOf(symbol) !== -1 ? symbol : 'default_mst',  // TODO: add check if logo available
          balance: balances.MST[symbol]
        });
      });
    });
  }

  ngOnDestroy(){
    if(this.balanceSubscription){
      this.balanceSubscription.unsubscribe();
    }
  }

}
