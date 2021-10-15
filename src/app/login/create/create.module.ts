import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { CreatePageRoutingModule } from './create-routing.module'

import { CreatePage } from './create.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forChild(),
    IonicModule,
    CreatePageRoutingModule,
  ],
  declarations: [CreatePage]
})
export class CreatePageModule {}
