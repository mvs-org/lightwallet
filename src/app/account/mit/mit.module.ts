import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { MitPageRoutingModule } from './mit-routing.module'

import { MitPage } from './mit.page'
import { TranslateModule } from '@ngx-translate/core'
import { PipesModule } from 'src/app/pipes/pipes.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    PipesModule,
    MitPageRoutingModule
  ],
  declarations: [
    MitPage,
  ]
})
export class MitPageModule {}
