import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DnaLockPage } from './dna-lock';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';
import { ProgressBarModule } from 'angular-progress-bar';
import { VoteItemModule } from '../../components/vote-item/vote-item.module';
import { IonicSelectableModule } from 'ionic-selectable';
import { NgxPaginationModule } from 'ngx-pagination';
import { DnaLockItemModule } from '../../components/dna-lock-item/dna-lock-item.module';

@NgModule({
    declarations: [
        DnaLockPage
    ],
    imports: [
        IonicPageModule.forChild(DnaLockPage),
        PipesModule,
        TranslateModule,
        ProgressBarModule,
        VoteItemModule,
        IonicSelectableModule,
        NgxPaginationModule,
        DnaLockItemModule
    ],
    providers:[
        AlertProvider
    ],
    exports: [
        DnaLockPage
    ]
})
export class DnaLockPageModule { }
