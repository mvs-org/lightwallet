import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { AccountPageRoutingModule } from './account-routing.module'
import { AccountPage } from './account.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    AccountPageRoutingModule
  ],
  declarations: [
    AccountPage,
  ],
})
export class AccountPageModule {}
