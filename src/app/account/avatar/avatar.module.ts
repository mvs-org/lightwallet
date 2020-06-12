import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { AvatarPageRoutingModule } from './avatar-routing.module'

import { AvatarPage } from './avatar.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    AvatarPageRoutingModule,
  ],
  declarations: [AvatarPage]
})
export class AvatarPageModule {}
