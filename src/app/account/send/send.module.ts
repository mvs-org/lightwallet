import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { SendPageRoutingModule } from './send-routing.module'

import { SendPage } from './send.page'
import { TranslateModule } from '@ngx-translate/core'
import { PipesModule } from 'src/app/pipes/pipes.module'
import { AttenuationModelSelectorComponent } from '../components/attenuation-model-selector/attenuation-model-selector.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    PipesModule,
    SendPageRoutingModule
  ],
  declarations: [
    AttenuationModelSelectorComponent,
    SendPage,
  ]
})
export class SendPageModule { }
