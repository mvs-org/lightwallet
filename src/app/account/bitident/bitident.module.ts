import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { BitidentPageRoutingModule } from './bitident-routing.module'

import { BitidentPage } from './bitident.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BitidentPageRoutingModule,
    TranslateModule.forChild(),
  ],
  declarations: [BitidentPage]
})
export class BitidentPageModule {}
