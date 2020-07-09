import { Component, OnInit } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { Router } from '@angular/router'
import { AlertService } from '../../../services/alert.service'
import { WalletService } from 'src/app/services/wallet.service'

@Component({
  selector: 'app-login-xpub',
  templateUrl: './login-xpub.page.html',
  styleUrls: ['./login-xpub.page.scss'],
})
export class LoginXpubPage implements OnInit {

  addresses: Array<string>
  validXpub = false
  xpub = ''

  constructor(
    public mvs: MetaverseService,
    private router: Router,
    private alertService: AlertService,
    private walletService: WalletService,
  ) { }

  ngOnInit() {
  }

  login(xpub) {
      this.alertService.showLoading()
          .then(() => this.walletService.setXpub(xpub))
          .then(() => this.mvs.addAddresses(this.addresses))
          .then(() => this.alertService.stopLoading())
          //.then(() => this.nav.setRoot('LoadingPage', { reset: true }))
          .then(() => this.router.navigate(['/loading']))
          .catch((error) => {
              console.error(error.message)
              this.alertService.stopLoading()
              switch (error.message){
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
          })
  }

  xpubValid = (xpub) => {
      if (!xpub || !(xpub.startsWith('xpub') || xpub.startsWith('tpub'))) {
          this.validXpub = false
          return
      }
      return this.walletService.getWalletFromMasterPublicKey(xpub)
          .then((wallet) => this.walletService.generateAddresses(wallet, 0, 10))
          .then((addresses) => {
              this.addresses = addresses
              this.validXpub = true
          })
          .catch((error) => {
              this.validXpub = false
          })
  }

}
