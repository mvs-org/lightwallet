import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { Platform } from '@ionic/angular';
import { MetaverseService, Network } from '../services/metaverse.service';
import { AccountService } from '../services/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  network: Network
  saved_accounts: Array<any> = []

  constructor(
    public config: ConfigService,
    public metaverse: MetaverseService,
    public platform: Platform,
    private account: AccountService,
    private router: Router,
  ) {

  }

  ngOnInit() {
    this.network = this.metaverse.network
  }

  ionViewWillEnter() {
    this.account.getSavedAccounts()
      .then((accounts) => this.saved_accounts = accounts ? accounts : [])
}

  loginViaAccount(account) {
    this.router.navigate(['login', 'account'],
      {
        skipLocationChange: true,
        queryParams: account,
      })
  }

}
