import { Component, OnInit } from '@angular/core'
import { Platform } from '@ionic/angular'
import { WalletService, } from '../services/wallet.service'
import { Router } from '@angular/router'
import { MetaverseService } from '../services/metaverse.service'
import { AppService } from '../services/app.service'
import { Title } from '@angular/platform-browser'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  network: string
  saved_accounts: Array<any> = []
  isApp: boolean

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
    this.network = await this.appService.getNetwork()
    this.title.setTitle((await this.translate.get('LOGIN.TITLE').toPromise()) as string)
  }

  ionViewWillEnter() {
    this.walletService.getSavedAccounts()
      .then((accounts) => this.saved_accounts = accounts ? accounts : [])
  }

  switchTheme(){
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
