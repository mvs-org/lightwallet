import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ClipboardModule } from 'ngx-clipboard'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { QrAddressComponent } from './qr-address.component'
import { Routes } from '@angular/router'
//import { NgxQRCodeModule } from 'ngx-qrcode2'

const routes: Routes = [
  {
    path: '',
    component: QrAddressComponent,
  },
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ClipboardModule,
    //NgxQRCodeModule,
    TranslateModule.forChild(),
  ],
  entryComponents: [QrAddressComponent],
  declarations: [QrAddressComponent],
})
export class QRAddressModule {}
