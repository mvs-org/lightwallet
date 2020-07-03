import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { DetailsPageRoutingModule } from './details-routing.module'

import { TranslateModule } from '@ngx-translate/core'
import { DetailsPage } from './details.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    DetailsPageRoutingModule,
  ],
  declarations: [DetailsPage]
})
export class DetailsPageModule {}
