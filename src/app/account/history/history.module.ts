import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistoryPageRoutingModule } from './history-routing.module';
import {NgxPaginationModule} from 'ngx-pagination'
import { HistoryPage } from './history.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TransactionItemComponent } from './transaction-item/transaction-item.component'
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    NgxPaginationModule,
    TranslateModule.forChild(),
    HistoryPageRoutingModule
  ],
  declarations: [HistoryPage, TransactionItemComponent]
})
export class HistoryPageModule {}
