import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MITTransferPage } from './mit-transfer';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        MITTransferPage,
    ],
    imports: [
        IonicPageModule.forChild(MITTransferPage),
        TranslateModule
    ]
})
export class MITTransferPageModule { }
