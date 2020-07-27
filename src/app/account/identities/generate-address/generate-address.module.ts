import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { GenerateAddressPageRoutingModule } from './generate-address-routing.module'
import { TranslateModule } from '@ngx-translate/core'
import { GenerateAddressPage } from './generate-address.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    GenerateAddressPageRoutingModule,
  ],
  declarations: [GenerateAddressPage]
})
export class GenerateAddressPageModule {}
