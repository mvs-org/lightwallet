import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransactionsPage } from './transactions';
import { TranslateModule} from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { ProgressBarModule } from 'angular-progress-bar';
import { NgxPaginationModule } from 'ngx-pagination';
import { TxItemModule } from '../../components/tx-item/tx-item.module';

@NgModule({
    declarations: [
        TransactionsPage,
    ],
    imports: [
        IonicPageModule.forChild(TransactionsPage),
        PipesModule,
        ProgressBarModule,
        TranslateModule,
        NgxPaginationModule,
        TxItemModule,
    ],
    exports: [
        TransactionsPage
    ]
})
export class TransactionsPageModule { }
