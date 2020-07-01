import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'
import { NgQrScannerModule, } from 'angular2-qrscanner'
import { ScanPageRoutingModule } from './scan-routing.module'

import { ScanPage } from './scan.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgQrScannerModule,
    ScanPageRoutingModule,
    TranslateModule.forChild(),
  ],
declarations: [ScanPage, ]
})
export class ScanPageModule { }
