import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { SwapPageRoutingModule } from './swap-routing.module'

import { SwapPage } from './swap.page'
import { PipesModule } from 'src/app/pipes/pipes.module'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    PipesModule,
    SwapPageRoutingModule
  ],
  declarations: [SwapPage]
})
export class SwapPageModule {}
