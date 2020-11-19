import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DnaVotePage } from './dna-vote';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';
import { ProgressBarModule } from 'angular-progress-bar';
import { VoteItemModule } from '../../components/vote-item/vote-item.module';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
    declarations: [
        DnaVotePage
    ],
    imports: [
        IonicPageModule.forChild(DnaVotePage),
        PipesModule,
        TranslateModule,
        ProgressBarModule,
        VoteItemModule,
        IonicSelectableModule,
    ],
    providers:[
        AlertProvider
    ],
    exports: [
        DnaVotePage
    ]
})
export class DnaVotePageModule { }
