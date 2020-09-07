import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ExportMobilePageRoutingModule } from './export-mobile-routing.module'

import { ExportMobilePage } from './export-mobile.page'
import { TranslateModule } from '@ngx-translate/core'
import { QrModule } from 'src/app/qr/qr.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QrModule,
    TranslateModule.forChild(),
    ExportMobilePageRoutingModule
  ],
  declarations: [ExportMobilePage]
})
export class ExportMobilePageModule {}
