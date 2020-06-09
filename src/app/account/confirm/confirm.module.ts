import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ConfirmPageRoutingModule } from './confirm-routing.module'

import { ConfirmPage } from './confirm.page'
import { TranslateModule } from '@ngx-translate/core'
import { ClipboardModule } from 'ngx-clipboard'
import { TransactionItemComponent } from './../components/transaction-item/transaction-item.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    ClipboardModule,
    ConfirmPageRoutingModule,
  ],
  declarations: [
    ConfirmPage,
    TransactionItemComponent,
  ]
})
export class ConfirmPageModule {}
