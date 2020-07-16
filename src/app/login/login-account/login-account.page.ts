import { Component, OnInit } from '@angular/core'
import { LoadingController, AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { WalletService } from 'src/app/services/wallet.service'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { ActivatedRoute, Router } from '@angular/router'
import { AlertService } from '../../services/alert.service'

@Component({
  selector: 'app-login-account',
  templateUrl: './login-account.page.html',
  styleUrls: ['./login-account.page.scss'],
})
export class LoginAccountPage implements OnInit {

  //loading: Loading
  account: any = history.state.data && history.state.data.account ? history.state.data.account : ''
  password = ''

  constructor(
    public mvs: MetaverseService,
    private router: Router,
    private walletService: WalletService,
    private loadingCtrl: LoadingController,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
  }

  cancel() {
    this.router.navigate(['login'])
  }

  async importAccount(account, password) {
    this.alertService.showLoading()
    try {
      const decryptedAccount = await this.walletService.decryptAccount(account.content, password)
      await Promise.all([
        this.walletService.setupAccount(account.name, decryptedAccount),
        this.walletService.setAccountParams(account.params)])
      const [wallet, indexFromWallet] = await Promise.all([
        this.walletService.getWallet(password),
        this.walletService.getAddressIndexFromWallet()
      ])
      const addresses = await this.walletService.generateAddresses(wallet, 0, account.params.index || indexFromWallet)
      await this.mvs.addAddresses(addresses)
      const xpub = await this.walletService.getMasterPublicKey(password)
      await this.walletService.setXpub(xpub)
      await this.walletService.saveSessionAccount(password)
      this.alertService.stopLoading()
      this.router.navigate(['/loading'], { state: { data: { reset: true } } })
    } catch (error) {
      console.error(error.message)
      this.alertService.stopLoading()
      switch (error.message) {
        case 'ERR_DECRYPT_WALLET':
          this.alertService.showError('MESSAGE.PASSWORD_WRONG', '')
          break
        case 'ERR_ACCOUNT_NAME_UNKNOWN':
          this.alertService.showError('MESSAGE.ERR_ACCOUNT_NAME_UNKNOWN', '')
          break
        default:
          this.alertService.showError('MESSAGE.ERR_IMPORT_ACCOUNT', error.message)
          break
      }
    }
  }

  async deleteAccount(accountName) {
    const confirm = await this.alertService.alertConfirm(
      'LOGIN_ACCOUNT.FORGET.TITLE',
      'LOGIN_ACCOUNT.FORGET.SUBTITLE',
      'LOGIN_ACCOUNT.FORGET.BUTTON.BACK',
      'LOGIN_ACCOUNT.FORGET.BUTTON.FORGET'
    )
    if (confirm) {
      await this.walletService.deleteAccount(accountName)
      this.router.navigate(['login'])
    }
  }

  passwordValid = (password) => (password) ? password.length > 3 : false

  complete = (password) => (password) ? this.passwordValid(password) : false

}
