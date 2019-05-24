import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TransactionHistoryPage } from './transaction-history.page';
import { HistoryItemComponent } from '../components/history-item/history-item.component';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: TransactionHistoryPage
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
    TransactionHistoryPage,
    HistoryItemComponent,
  ]
})
export class TransactionHistoryPageModule {}
