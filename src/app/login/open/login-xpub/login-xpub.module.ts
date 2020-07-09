import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { LoginXpubPageRoutingModule } from './login-xpub-routing.module'

import { LoginXpubPage } from './login-xpub.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    LoginXpubPageRoutingModule
  ],
  declarations: [LoginXpubPage]
})
export class LoginXpubPageModule {}
