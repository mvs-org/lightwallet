import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MITTransferPage } from './mit-transfer';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        MITTransferPage,
    ],
    providers: [
        AlertProvider
    ],
    imports: [
        IonicPageModule.forChild(MITTransferPage),
        PipesModule,
        TranslateModule
    ]
})
export class MITTransferPageModule { }
