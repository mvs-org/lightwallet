import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ConfirmPageRoutingModule } from './confirm-routing.module'

import { ConfirmPage } from './confirm.page'
import { TranslateModule } from '@ngx-translate/core'
import { ClipboardModule } from 'ngx-clipboard'
import { TransactionItemModule } from './../components/transaction-item/transaction-item.module'
import { PipesModule } from 'src/app/pipes/pipes.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    ClipboardModule,
    PipesModule,
    TransactionItemModule,
    ConfirmPageRoutingModule,
  ],
  declarations: [
    ConfirmPage,
  ]
})
export class ConfirmPageModule {}
