import { Component, OnInit, OnDestroy } from '@angular/core'
import { Platform } from '@ionic/angular'
import { WalletService, } from '../services/wallet.service'
import { Router } from '@angular/router'
import { MetaverseService } from '../services/metaverse.service'
import { AppService } from '../services/app.service'
import { Title } from '@angular/platform-browser'
import { TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {

  network: string
  saved_accounts: Array<any> = []
  isApp: boolean

  networkSubscription: Subscription
  translateSubscription: Subscription

  constructor(
    public metaverse: MetaverseService,
    public appService: AppService,
    public platform: Platform,
    private walletService: WalletService,
    private router: Router,
    private title: Title,
    private translate: TranslateService,
  ) {

  }

  async ngOnInit() {
    this.networkSubscription = this.appService.network$.subscribe(network => {
      this.network = network
    })
    this.translateSubscription = this.translate.onLangChange.subscribe(async () => {
      const title = await this.translate.get('LOGIN.TITLE').toPromise() || 'MyETPWallet'
      this.title.setTitle(title)
    })
  }

  ngOnDestroy() {
    if (this.translateSubscription) {
      this.translateSubscription.unsubscribe()
    }
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe()
    }
  }

  ionViewWillEnter() {
    this.walletService.getSavedAccounts()
      .then((accounts) => this.saved_accounts = accounts ? accounts : [])
  }

  switchTheme() {
    console.trace('to be implemented')
  }

  setNetwork(event: CustomEvent) {
    this.appService.updateNetwork(event.detail.value)
  }

  loginViaAccount(account) {
    this.router.navigate(['login', 'account'],
      {
        skipLocationChange: true,
        queryParams: account,
      })
  }

}
