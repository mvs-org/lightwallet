import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard';
import { ConfigService } from 'src/app/services/config.service';


@Component({
  selector: 'app-qr-address',
  templateUrl: './qr-address.component.html',
  styleUrls: ['./qr-address.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QrAddressComponent implements OnInit {

  @Input() address: string;

  constructor(
    private modalCtrl: ModalController,
    private clipboard: ClipboardService,
    private toast: ToastController,
    private translate: TranslateService,
    private config: ConfigService,
  ) {
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async copy() {
    this.clipboard.copyFromContent(this.address);
    (await this.toast.create({
      message: await this.translate.get('QR_ADDRESS.COPY_SUCCESS').toPromise(),
      duration: this.config.shortToastDuration,
      color: 'success'
    })).present();
    this.close();
  }

  ngOnInit() { }

}
