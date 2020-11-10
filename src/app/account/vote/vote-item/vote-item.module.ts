import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { TranslateModule } from '@ngx-translate/core'
import { PipesModule } from 'src/app/pipes/pipes.module'
import { VoteItemComponent } from './vote-item.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    PipesModule,
  ],
  declarations: [
    VoteItemComponent,
  ],
  exports: [
    VoteItemComponent,
  ]
})
export class VoteItemModule { }
