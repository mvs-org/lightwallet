import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular'
import { Router } from '@angular/router'
import { WalletService } from '../../services/wallet.service'

@Component({
  selector: 'app-open',
  templateUrl: './open.page.html',
  styleUrls: ['./open.page.scss'],
})
export class OpenPage implements OnInit {

  saved_accounts: Array<any> = []
  isApp: boolean

  constructor(
    public platform: Platform,
    private router: Router,
    private walletService: WalletService,
  ) { }

  ngOnInit() {
    this.isApp = this.walletService.isApp()
  }

  ionViewWillEnter() {
    this.walletService.getSavedAccounts()
      .then((accounts) => this.saved_accounts = accounts ? accounts : [])
  }


  loginViaAccount(account) {
    this.router.navigate(['login', 'account'], { state: { data: { account } } })
  }

}
