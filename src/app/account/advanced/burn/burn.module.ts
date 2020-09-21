import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { BurnPageRoutingModule } from './burn-routing.module'

import { BurnPage } from './burn.page'
import { PipesModule } from 'src/app/pipes/pipes.module'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    PipesModule,
    BurnPageRoutingModule
  ],
  declarations: [BurnPage]
})
export class BurnPageModule {}
