import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransactionsPage } from './transactions';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        TransactionsPage,
    ],
    imports: [
        IonicPageModule.forChild(TransactionsPage),
        TranslateModule
    ],
    exports: [
        TransactionsPage
    ]
})
export class TransactionsPageModule { }
