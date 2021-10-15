import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { GenerateVmAddressPageRoutingModule } from './generate-vm-address-routing.module'
import { TranslateModule } from '@ngx-translate/core'
import { GenerateVmAddressPage } from './generate-vm-address.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    GenerateVmAddressPageRoutingModule,
  ],
  declarations: [GenerateVmAddressPage]
})
export class GenerateVmAddressPageModule {}
