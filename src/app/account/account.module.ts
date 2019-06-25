import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { AccountPage } from './account.page'
import { EtpCardComponent } from './components/etp-card/etp-card'
import { MSTCardComponent } from './components/mst-card/mst-card'
import { MITCardComponent } from './components/mit-card/mit-card'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { PipesModule } from '../pipes/pipes.module'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { HttpClient } from '@angular/common/http'

const routes: Routes = [
  {
    path: '',
    component: AccountPage,
  },
  {
    path: 'send/:symbol',
    loadChildren: './send/send.module#SendPageModule',
  },
  {
    path: 'history/:symbol',
    loadChildren: './transaction-history/transaction-history.module#TransactionHistoryPageModule',
  },
  {
    path: 'history',
    loadChildren: './transaction-history/transaction-history.module#TransactionHistoryPageModule',
  },
  {
    path: 'addresses/:symbol',
    loadChildren: './addresses/addresses.module#AddressesPageModule',
  },
]

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json')
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient],
      },
    }),
    PipesModule,
  ],
  declarations: [
    AccountPage,
    EtpCardComponent,
    MSTCardComponent,
    MITCardComponent,
  ],
})
export class AccountPageModule { }
