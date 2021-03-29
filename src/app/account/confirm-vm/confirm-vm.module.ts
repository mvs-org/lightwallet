import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ConfirmVmPageRoutingModule } from './confirm-vm-routing.module'

import { ConfirmVmPage } from './confirm-vm.page'
import { TranslateModule } from '@ngx-translate/core'
import { TransactionItemVmModule } from '../components/transaction-item-vm/transaction-item-vm.module'
import { PipesModule } from 'src/app/pipes/pipes.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    PipesModule,
    TransactionItemVmModule,
    ConfirmVmPageRoutingModule,
  ],
  declarations: [
    ConfirmVmPage,
  ]
})
export class ConfirmVmPageModule {}
