import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { TranslateModule } from '@ngx-translate/core'
import { PipesModule } from 'src/app/pipes/pipes.module'
import { AttenuationModelSelectorComponent } from './attenuation-model-selector.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    PipesModule,
  ],
  declarations: [
    AttenuationModelSelectorComponent,
  ],
  exports: [
    AttenuationModelSelectorComponent,
  ]
})
export class AttenuationModelSelectorModule { }
