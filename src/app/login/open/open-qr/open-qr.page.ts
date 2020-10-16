import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { AlertService } from 'src/app/services/alert.service'
import { AppService } from 'src/app/services/app.service'
import { WalletService } from 'src/app/services/wallet.service'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { Router } from '@angular/router'
import { ScanPage } from 'src/app/scan/scan.page'

@Component({
  selector: 'app-open-qr',
  templateUrl: './open-qr.page.html',
  styleUrls: ['./open-qr.page.scss'],
})
export class OpenQrPage implements OnInit {

  qrCodeLoaded: boolean
  seed: string
  xpub: string
  index: number
  password: string
  isMobile: boolean

  constructor(
    private modalCtrl: ModalController,
    private alertService: AlertService,
    private appService: AppService,
    private walletService: WalletService,
    private metaverseService: MetaverseService,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.isMobile = this.walletService.isMobile()
  }

  async scan() {
    const modal = await this.modalCtrl.create({
      component: ScanPage,
      showBackdrop: false,
      backdropDismiss: false,
    })
    modal.onWillDismiss().then(result => {
      if (result.data && result.data.text) {
        this.alertService.showLoading().then(() => {
          const content = result.data.text.toString().split('&')
          this.seed = content[0]
          const network = content[1]
          this.index = Math.max(5, Math.min(parseInt(content[2], 10), 50))
          const xpub = content[3]
          if (content.length < 3 || content.length > 4) {
            this.alertService.stopLoading()
            this.alertService.showError('IMPORT_QR.MESSAGE.ERROR_QRCODE', '')
          } else {
            this.appService.getNetwork()
              .then((currentNetwork) => {
                if (network !== currentNetwork.charAt(0)) {
                  this.alertService.stopLoading()
                  this.alertService.showError('IMPORT_QR.MESSAGE.ERROR_NETWORK_MISMATCH', '')
                } else {
                  if (this.seed) {
                    this.walletService.setMobileWallet(this.seed).then(() => this.qrCodeLoaded = true)
                    this.alertService.stopLoading()
                  } else if (xpub) {
                    this.walletService.getWalletFromMasterPublicKey(xpub)
                      .then((wallet) => this.walletService.generateAddresses(wallet, 0, this.index))
                      .then((addresses) => this.metaverseService.addAddresses(addresses))
                      .then(() => this.walletService.setXpub(xpub))
                      .then(() => this.router.navigate(['/loading'], { state: { data: { reset: true } } }))
                      .then(() => this.alertService.stopLoading())
                  } else {
                    this.alertService.stopLoading()
                    this.alertService.showError('IMPORT_QR.MESSAGE.ERROR_QRCODE', '')
                  }
                }
              })
          }
        })
      }
      modal.remove()
    })
    await modal.present()
  }

  passwordValid = (password) => (password) ? password.length > 0 : false

  async decrypt(password: string, seed: string) {
    try {
      await this.alertService.showLoading()
      await this.walletService.setMobileWallet(seed)
      const xpub = await this.walletService.getMasterPublicKey(password)
      await this.walletService.setXpub(xpub)
      const wallet = await this.walletService.getWallet(password)
      const addresses = await this.walletService.generateAddresses(wallet, 0, this.index)
      await this.metaverseService.setAddresses(addresses)
      await this.walletService.saveSessionAccount(password)
      this.alertService.stopLoading()
      this.router.navigate(['/loading'], { state: { data: { reset: true } } })
    } catch (e) {
      console.error(e)
      this.alertService.showError('IMPORT_QR.MESSAGE.PASSWORD_WRONG', '')
      this.alertService.stopLoading()
    }
  }

}
