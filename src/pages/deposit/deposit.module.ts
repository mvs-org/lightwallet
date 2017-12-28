import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DepositPage } from './deposit';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        DepositPage,
    ],
    imports: [
        IonicPageModule.forChild(DepositPage),
        TranslateModule
    ],
    exports: [
        DepositPage
    ]
})
export class DepositPageModule { }
