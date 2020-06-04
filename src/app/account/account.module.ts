import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { AccountPageRoutingModule } from './account-routing.module'

import { AccountPage } from './account.page'
import { TranslateModule } from '@ngx-translate/core'
import { EtpCardComponent } from './components/etp-card/etp-card.component'
import { PipesModule } from '../pipes/pipes.module'
import { MSTCardComponent } from './components/mst-card/mst-card.component'
import { MITCardComponent } from './components/mit-card/mit-card.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule.forChild(),
    AccountPageRoutingModule
  ],
  declarations: [
    AccountPage,
    EtpCardComponent,
    MSTCardComponent,
    MITCardComponent,
  ]
})
export class AccountPageModule {}
