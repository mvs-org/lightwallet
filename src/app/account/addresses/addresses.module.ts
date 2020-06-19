import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { AddressesPageRoutingModule } from './addresses-routing.module'
import { ClipboardModule } from 'ngx-clipboard'
import { AddressesPage } from './addresses.page'
import { TranslateModule } from '@ngx-translate/core'
import { QrModule } from 'src/app/qr/qr.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forChild(),
    IonicModule,
    ClipboardModule,
    QrModule,
    AddressesPageRoutingModule,
  ],
  declarations: [AddressesPage]
})
export class AddressesPageModule {}
