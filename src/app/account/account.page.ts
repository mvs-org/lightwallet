import { Component, OnInit } from '@angular/core';
import { MetaverseService, Balance } from '../services/metaverse.service';
import { WalletService } from '../services/wallet.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  balances$ = this.wallet.balances(this.metaverse);

  constructor(
    private metaverse: MetaverseService,
    private wallet: WalletService,
  ) { }

  ngOnInit() {
    this.metaverse.getData();
  }

  entries = (o: object) => Object.entries(o);


}
