import { Component, OnInit, } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { WalletService } from 'src/app/services/wallet.service'
import { AppService } from 'src/app/services/app.service'
import { AlertService } from 'src/app/services/alert.service'
import { Router } from '@angular/router'


@Component({
  selector: 'app-generate-address',
  templateUrl: './generate-vm-address.page.html',
  styleUrls: ['./generate-vm-address.page.scss'],
})
export class GenerateVmAddressPage implements OnInit {

  index: number
  passphrase: string
  walletFromXpub: any
  loading = true

  constructor(
    private metaverseService: MetaverseService,
    public walletService: WalletService,
    public appService: AppService,
    private alertService: AlertService,
    private router: Router,
  ) {
  }

  ngOnInit() {
  }

  async ionViewDidEnter() {

    this.loading = false
  }

  cancel() {
    this.router.navigate(['account', 'identities'])
  }

  async generateAddress(passphrase) {
    try {
      await this.alertService.showLoading()
      await this.walletService.setVmAddressFromPassphrase(passphrase)
      this.alertService.stopLoading()
      this.router.navigate(['account', 'identities'])
    } catch (error) {
      console.error(error)
      this.alertService.stopLoading()
      switch (error.message) {
        case 'ERR_DECRYPT_WALLET_FROM_SEED':
          this.alertService.showError('MESSAGE.PASSWORD_WRONG', '')
          break
        default:
          this.alertService.showError('GENERATE_VM_ADDRESSES.ERROR.UNKOWN_ERROR', error.message)
          break
      }
    }
  }

  validPassword = (passphrase: string) => (passphrase) ? passphrase.length > 3 : false


}
