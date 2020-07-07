import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { DetailsPageRoutingModule } from './details-routing.module'

import { DetailsPage } from './details.page'
import { TranslateModule } from '@ngx-translate/core'
import { PipesModule } from 'src/app/pipes/pipes.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule.forChild(),
    DetailsPageRoutingModule,
  ],
  declarations: [DetailsPage]
})
export class DetailsPageModule {}
