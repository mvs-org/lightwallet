import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { WalletService } from 'src/app/services/wallet.service'
import { TranslateService } from '@ngx-translate/core'
import { QrComponent } from 'src/app/qr/qr.component'

@Component({
  selector: 'app-export-mobile',
  templateUrl: './export-mobile.page.html',
  styleUrls: ['./export-mobile.page.scss'],
})

export class ExportMobilePage implements OnInit {

  connectcode: any = ''
  disclaimerAgreed = false
  hasSeed: boolean
  hasXpub: boolean

  constructor(
    public modalController: ModalController,
    public walletService: WalletService,
    private translate: TranslateService,
  ) { }

  async ngOnInit() {
    const xpub = await this.walletService.getXpub()
    this.hasXpub = (xpub !== null && xpub !== undefined)

    this.hasSeed = await this.walletService.hasSeed()

  }

  async exportWallet() {
    const content = await this.walletService.exportWallet()

    const translations = await this.translate.get(['EXPORT_MOBILE.SHOW_FULL_WALLET.TITLE']).toPromise()
    const title = translations['EXPORT_MOBILE.SHOW_FULL_WALLET.TITLE']

    const qrcodeModal = await this.modalController.create({
      component: QrComponent,
      componentProps: {
        title,
        content,
      }
    })
    await qrcodeModal.present()
  }

  async exportViewOnlyWallet() {
    const content = await this.walletService.exportWalletViewOnly()

    const translations = await this.translate.get(['EXPORT_MOBILE.SHOW_VIEW_ONLY.TITLE']).toPromise()
    const title = translations['EXPORT_MOBILE.SHOW_VIEW_ONLY.TITLE']

    const qrcodeModal = await this.modalController.create({
      component: QrComponent,
      componentProps: {
        title,
        content,
      }
    })
    await qrcodeModal.present()
  }

}
