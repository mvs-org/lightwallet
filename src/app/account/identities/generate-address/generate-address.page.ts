import { Component, OnInit } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { WalletService } from 'src/app/services/wallet.service'
import { AppService } from 'src/app/services/app.service'
import { Router } from '@angular/router'
import { AlertService } from 'src/app/services/alert.service'

@Component({
  selector: 'app-generate-address',
  templateUrl: './generate-address.page.html',
  styleUrls: ['./generate-address.page.scss'],
})
export class GenerateAddressPage implements OnInit {

  index: number
  passphrase: string
  walletFromXpub: any
  loading = true

  constructor(
    private metaverseService: MetaverseService,
    public walletService: WalletService,
    private router: Router,
    public appService: AppService,
    private alert: AlertService,
  ) {
  }

  ngOnInit() {
  }

  async ionViewDidEnter() {
    console.log('ionViewDidLoad GenerateAddressPage')
    this.index = await this.walletService.getAddressIndex() || 10

    const xpub = await this.walletService.getXpub()
    if (xpub) {
      this.walletFromXpub = await this.walletService.getWalletFromMasterPublicKey(xpub)
    }
    console.log("Here")
    this.loading = false
  }

  cancel() {
    this.router.navigate(['account', 'identities'])
  }

  async setIndex() {
    if (this.walletFromXpub) {
      this.setIndexFromXpub()
    } else {
      this.setIndexFromWallet()
    }
  }

  async setIndexFromWallet() {
    try {
      await this.alert.showLoading()
      const wallet = await this.walletService.getWallet(this.passphrase)
      const addresses = await this.walletService.generateAddresses(wallet, 0, this.index)
      await this.metaverseService.setAddresses(addresses)
      const xpub = await this.walletService.getMasterPublicKey(this.passphrase)
      await this.walletService.setXpub(xpub)
      this.alert.stopLoading()
      this.router.navigate(['/loading'], { state: { data: { reset: false } } })
    } catch (error) {
      console.error(error)
      this.alert.stopLoading()
      switch (error.message) {
        case 'ERR_DECRYPT_WALLET':
          this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
          break
        default:
          this.alert.showError('GENERATE_ADDRESSES.ERROR', error.message)
          break
      }
    }
  }

  async setIndexFromXpub() {
    try {
      await this.alert.showLoading()
      const addresses = await this.walletService.generateAddresses(this.walletFromXpub, 0, this.index)
      await this.metaverseService.setAddresses(addresses)
      await this.alert.stopLoading()
      this.router.navigate(['/loading'], { state: { data: { reset: false } } })
    } catch (error) {
      console.error(error)
      this.alert.stopLoading()
      switch (error.message) {
        case 'ERR_DECRYPT_WALLET':
          this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
          break
        default:
          this.alert.showError('GENERATE_ADDRESSES.ERROR.UNKOWN_ERROR', error.message)
          break
      }
    }
  }

  validIndex = (index: number) => index >= 2 && index <= this.appService.max_addresses

  validPassword = (passphrase: string) => (passphrase) ? passphrase.length > 3 : false


}
