import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ExportXpubPageRoutingModule } from './export-xpub-routing.module'

import { ExportXpubPage } from './export-xpub.page'
import { TranslateModule } from '@ngx-translate/core'
import { ClipboardModule } from 'ngx-clipboard'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClipboardModule,
    TranslateModule.forChild(),
    ExportXpubPageRoutingModule
  ],
  declarations: [ExportXpubPage]
})
export class ExportXpubPageModule {}
