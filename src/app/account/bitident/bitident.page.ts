import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { ScanPage } from 'src/app/scan/scan.page'
import { ModalController } from '@ionic/angular'
import { AlertService } from 'src/app/services/alert.service'
import { WalletService } from 'src/app/services/wallet.service'

@Component({
  selector: 'app-bitident',
  templateUrl: './bitident.page.html',
  styleUrls: ['./bitident.page.scss'],
})
export class BitidentPage implements OnInit {

  isMobile: boolean
  manualEnterMobile: boolean
  token: string
  leftTime = 0

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private alertService: AlertService,
    private walletService: WalletService,
  ) {
    this.isMobile = this.walletService.isMobile()
  }

  ngOnInit() {
  }

  async scan() {
    const modal = await this.modalCtrl.create({
      component: ScanPage,
      showBackdrop: false,
      backdropDismiss: false,
    })
    modal.onWillDismiss().then(result => {
      if (result.data && result.data.text) {
        this.getLastElement(result.data.text.toString())
      }
      modal.remove()
    })
    await modal.present()
  }

  getLastElement(token) {
    const target = /(\w+)$/i.test(token) ? /(\w+)$/i.exec(token)[0] : ''
    if (target) {
      this.gotoAuthConfirm(target.trim())
    } else {
      this.alertService.showMessage('SCAN.INVALID_BITIDENT.TITLE', 'SCAN.INVALID_BITIDENT.SUBTITLE', '')
    }
  }

  isUrl = (url) => (!/[^A-Za-z0-9@_.-]/g.test(url))

  validAuthToken = (token: string) => (token) ? /(\w+)$/i.test(token) : false

  gotoAuthConfirm = (token) => this.router.navigate(['account', 'bitident', 'confirm'], { state: { data: { token } } })

  howToAuth = () => this.router.navigate(['account', 'bitident', 'howto'])

}
