import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DnaTransactionsPage } from './dna-transactions';
import { TranslateModule} from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { ProgressBarModule } from 'angular-progress-bar';
import { NgxPaginationModule } from 'ngx-pagination';
import { DnaTxItemModule } from '../../components/dna-tx-item/dna-tx-item.module';

@NgModule({
    declarations: [
        DnaTransactionsPage,
    ],
    imports: [
        IonicPageModule.forChild(DnaTransactionsPage),
        PipesModule,
        ProgressBarModule,
        TranslateModule,
        NgxPaginationModule,
        DnaTxItemModule,
    ],
    exports: [
        DnaTransactionsPage
    ]
})
export class DnaTransactionsPageModule { }
