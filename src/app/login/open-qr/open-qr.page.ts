import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { ScanPage } from '../../scan/scan.page'

@Component({
  selector: 'app-open-qr',
  templateUrl: './open-qr.page.html',
  styleUrls: ['./open-qr.page.scss'],
})
export class OpenQrPage implements OnInit {

  constructor(
    private modalCtrl: ModalController,
  ) { }

  async ngOnInit() {
  }

  async scan() {
    const modal = await this.modalCtrl.create({
      component: ScanPage,
      showBackdrop: false,
      backdropDismiss: false,
    })
    modal.onWillDismiss().then(data => {
      console.log({ data })
      modal.remove()
      
    })
    await modal.present()

  }

}
