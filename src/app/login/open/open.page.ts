import { Component, OnInit } from '@angular/core'
import { Platform } from '@ionic/angular'
import { Router } from '@angular/router'
import { WalletService } from '../../services/wallet.service'
import { AlertService } from 'src/app/services/alert.service'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { AppService } from 'src/app/services/app.service'

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
    private alertService: AlertService,
    private metaverseService: MetaverseService,
    public globals: AppService,
  ) { }

  ngOnInit() {
    this.isApp = this.walletService.isApp()
  }

  ionViewWillEnter() {
    this.walletService.getSavedAccounts()
      .then((accounts) => this.saved_accounts = accounts ? accounts : [])
  }


  loginViaAccount(account) {
    if (account.content) {
      this.router.navigate(['login', 'account'], { state: { data: { account } } })
    } else {
      this.loginAccountViewOnly(account)
    }
  }

  async loginAccountViewOnly(account) {
    try {
      const accountName = account.name
      const content = account.view_only_content
      await this.alertService.showLoading()
      const wallet = await this.walletService.getWalletFromMasterPublicKey(content.xpub)
      const addresses = this.walletService.generateAddresses(wallet, 0, account.params.index || this.globals.index)
      await this.metaverseService.addAddresses(addresses)
      await this.walletService.setupViewOnlyAccount(accountName, content)
      this.alertService.stopLoading()
      this.router.navigate(['/loading'], { state: { data: { reset: true } } })
    } catch (error) {
      console.error(error.message)
      this.alertService.stopLoading()
      switch (error.message) {
        case 'LOGIN_ACCOUNT.MESSAGE.ERR_DECRYPT_WALLET':
          this.alertService.showError('MESSAGE.PASSWORD_WRONG', '')
          break
        case 'LOGIN_ACCOUNT.MESSAGE.ERR_ACCOUNT_NAME_UNKNOWN':
          this.alertService.showError('MESSAGE.ERR_ACCOUNT_NAME_UNKNOWN', '')
          break
        default:
          this.alertService.showError('LOGIN_ACCOUNT.MESSAGE.ERR_IMPORT_ACCOUNT', error.message)
          break
      }
    }
  }

}
