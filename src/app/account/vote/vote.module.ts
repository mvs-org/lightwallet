import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { VotePageRoutingModule } from './vote-routing.module'

import { VotePage } from './vote.page'
import { TranslateModule } from '@ngx-translate/core'
import { VoteItemModule } from './vote-item/vote-item.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VoteItemModule,
    TranslateModule.forChild(),
    VotePageRoutingModule,
  ],
  declarations: [
    VotePage,
  ]
})
export class VotePageModule {}
