import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { IonicModule } from '@ionic/angular'

import { TranslateModule } from '@ngx-translate/core'
import { PipesModule } from 'src/app/pipes/pipes.module'
import { InputItemComponent } from './input-item/input-item'
import { OutputItemComponent } from './output-item/output-item'
import { TransactionItemComponent } from './transaction-item.component'
import { RouterModule } from '@angular/router'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule.forChild(),
    RouterModule,
    PipesModule,
  ],
  declarations: [
    InputItemComponent,
    OutputItemComponent,
    TransactionItemComponent,
  ],
  exports: [
    InputItemComponent,
    OutputItemComponent,
    TransactionItemComponent,
  ]
})
export class TransactionItemModule { }
