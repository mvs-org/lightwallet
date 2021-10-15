import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ConfirmPageRoutingModule } from './confirm-routing.module'

import { ConfirmPage } from './confirm.page'
import { TranslateModule } from '@ngx-translate/core'
import { CountdownModule } from 'ngx-countdown'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CountdownModule,
    TranslateModule.forChild(),
    ConfirmPageRoutingModule
  ],
  declarations: [ConfirmPage]
})
export class ConfirmPageModule {}
