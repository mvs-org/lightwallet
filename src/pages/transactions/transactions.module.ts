import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransactionsPage } from './transactions';
import { TranslateModule} from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { ProgressBarModule } from 'angular-progress-bar';

@NgModule({
    declarations: [
        TransactionsPage,
    ],
    imports: [
        IonicPageModule.forChild(TransactionsPage),
        PipesModule,
        ProgressBarModule,
        TranslateModule
    ],
    exports: [
        TransactionsPage
    ]
})
export class TransactionsPageModule { }
