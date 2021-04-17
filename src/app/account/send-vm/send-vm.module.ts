import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { SendVmPageRoutingModule } from './send-vm-routing.module'

import { SendVmPage } from './send-vm.page'
import { PipesModule } from 'src/app/pipes/pipes.module'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    PipesModule,
    SendVmPageRoutingModule
  ],
  declarations: [SendVmPage]
})
export class SendVmPageModule {}
