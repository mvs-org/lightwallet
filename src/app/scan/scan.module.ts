import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'
import { ScanPageRoutingModule } from './scan-routing.module'

import { ScanPage } from './scan.page'
import { TranslateModule } from '@ngx-translate/core'
import { ZXingScannerModule } from '@zxing/ngx-scanner'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ZXingScannerModule,
    ScanPageRoutingModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    ScanPage,
  ]
})
export class ScanPageModule { }
