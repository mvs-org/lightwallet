import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AccountPage } from './account.page';
import { EtpCardComponent } from './components/etp-card/etp-card';
import { MSTCardComponent } from './components/mst-card/mst-card';
import { MITCardComponent } from './components/mit-card/mit-card';
import { TranslateModule } from '@ngx-translate/core';
import { FormatPipe } from '../pipes/format/format';
import { AppModule } from '../app.module';
import { PipesModule } from '../pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: AccountPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    PipesModule,
  ],
  declarations: [
    AccountPage,
    EtpCardComponent,
    MSTCardComponent,
    MITCardComponent,
  ]
})
export class AccountPageModule {}
