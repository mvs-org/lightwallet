import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VotePage } from './vote';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';
import { ProgressBarModule } from 'angular-progress-bar';
import { VoteItemModule } from '../../components/vote-item/vote-item.module';

@NgModule({
    declarations: [
        VotePage
    ],
    imports: [
        IonicPageModule.forChild(VotePage),
        PipesModule,
        TranslateModule,
        ProgressBarModule,
        VoteItemModule,
    ],
    providers:[
        AlertProvider
    ],
    exports: [
        VotePage
    ]
})
export class VotePageModule { }
