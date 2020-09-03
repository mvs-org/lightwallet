import { Component, OnInit, ViewChild } from '@angular/core'
import { Subscription } from 'rxjs'
import { ZXingScannerComponent } from '@zxing/ngx-scanner'
import { ModalController } from '@ionic/angular'
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx'
import { WalletService } from '../services/wallet.service'

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {

  @ViewChild('scanner', { static: false })
  scanner: ZXingScannerComponent
  isApp: boolean
  scanSubscription: Subscription

  constructor(
    private modalCtrl: ModalController,
    private barcodeScanner: BarcodeScanner,
    private walletService: WalletService,
  ) { }

  scanComplete(e: any) {
    if (e) {
      this.modalCtrl.dismiss({ text: e.text })
    }
  }

  cancel() {
    this.modalCtrl.dismiss({})
  }


  ngOnInit() {
    this.isApp = this.walletService.isApp()
    if (this.isApp) {
      this.scan()
    }
  }

  /**
   * 
   * @param devices Try to default the camera to back
   */
  onCamerasFound(devices: any[]) {
    for (const device of devices) {
      if (/back|rear|environment/gi.test(device.label)) {
        this.scanner.device = device
        break
      }
    }
  }

  scan() {
    this.barcodeScanner.scan().then(barcodeData => {
      this.modalCtrl.dismiss(barcodeData)
    }).catch(err => {
      this.cancel()
    })
  }

}
