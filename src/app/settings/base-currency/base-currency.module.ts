import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { BaseCurrencyPageRoutingModule } from './base-currency-routing.module'

import { BaseCurrencyPage } from './base-currency.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    BaseCurrencyPageRoutingModule,
  ],
  declarations: [BaseCurrencyPage]
})
export class BaseCurrencyPageModule {}
