import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TransactionHistoryPage } from './transaction-history.page';
import { HistoryItemComponent } from '../components/history-item/history-item.component';


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
  ],
  declarations: [
    TransactionHistoryPage,
    HistoryItemComponent,
  ]
})
export class TransactionHistoryPageModule {}
