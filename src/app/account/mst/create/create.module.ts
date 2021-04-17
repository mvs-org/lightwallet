import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { CreatePageRoutingModule } from './create-routing.module'

import { CreatePage } from './create.page'
import { TranslateModule } from '@ngx-translate/core'
import { PipesModule } from 'src/app/pipes/pipes.module'
import { AttenuationModelSelectorModule } from './../../components/attenuation-model-selector/attenuation-model-selector.module'
import { MiningModelSelectorComponent } from './mining-model-selector/mining-model-selector.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    AttenuationModelSelectorModule,
    TranslateModule.forChild(),
    CreatePageRoutingModule,
  ],
  declarations: [
    MiningModelSelectorComponent,
    CreatePage,
  ]
})
export class CreatePageModule {}
