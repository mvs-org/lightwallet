import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { IdentitiesPageRoutingModule } from './identities-routing.module'
import { ClipboardModule } from 'ngx-clipboard'
import { IdentitiesPage } from './identities.page'
import { TranslateModule } from '@ngx-translate/core'
import { QrModule } from 'src/app/qr/qr.module'
import { PipesModule } from 'src/app/pipes/pipes.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forChild(),
    IonicModule,
    ClipboardModule,
    QrModule,
    PipesModule,
    IdentitiesPageRoutingModule,
  ],
  declarations: [IdentitiesPage]
})
export class IdentitiesPageModule {}
