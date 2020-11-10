import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { DecodePageRoutingModule } from './decode-routing.module'

import { DecodePage } from './decode.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    DecodePageRoutingModule,
  ],
  declarations: [DecodePage]
})
export class DecodePageModule {}
