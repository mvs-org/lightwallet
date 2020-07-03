import { Component, OnInit, ViewChild } from '@angular/core'
import { Subscription } from 'rxjs'
import { ZXingScannerComponent } from '@zxing/ngx-scanner'
import { ModalController } from '@ionic/angular'

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {

  @ViewChild('scanner', { static: false })
  scanner: ZXingScannerComponent

  scanSubscription: Subscription
  constructor(
    private modalCtrl: ModalController,
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

}
