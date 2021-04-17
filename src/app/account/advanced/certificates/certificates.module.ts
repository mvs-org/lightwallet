import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { CertificatesPageRoutingModule } from './certificates-routing.module'

import { CertificatesPage } from './certificates.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    CertificatesPageRoutingModule,
  ],
  declarations: [CertificatesPage]
})
export class CertificatesPageModule {}
