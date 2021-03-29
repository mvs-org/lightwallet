import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { IonicModule } from '@ionic/angular'

import { TranslateModule } from '@ngx-translate/core'
import { PipesModule } from 'src/app/pipes/pipes.module'
import { TransactionItemVmComponent } from './transaction-item-vm.component'
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
    TransactionItemVmComponent,
  ],
  exports: [
    TransactionItemVmComponent,
  ]
})
export class TransactionItemVmModule { }
