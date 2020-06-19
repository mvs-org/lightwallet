import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrComponent } from './qr.component';
import { NgxQRCodeModule } from 'ngx-qrcode2'
import { IonicModule } from '@ionic/angular'

@NgModule({
  declarations: [QrComponent],
  imports: [
    CommonModule,
    IonicModule,
    NgxQRCodeModule,
  ],
  exports: [QrComponent]
})
export class QrModule { }
