import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ExportPrivateKeyVmPageRoutingModule } from './export-private-key-vm-routing.module'

import { ExportPrivateKeyVmPage } from './export-private-key-vm.page'
import { TranslateModule } from '@ngx-translate/core'
import { ClipboardModule } from 'ngx-clipboard'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClipboardModule,
    TranslateModule.forChild(),
    ExportPrivateKeyVmPageRoutingModule
  ],
  declarations: [ExportPrivateKeyVmPage]
})
export class ExportPrivateKeyVmPageModule {}
