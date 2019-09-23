import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfirmTxPage } from './confirm-tx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { TxItemModule } from '../../components/tx-item/tx-item.module';
import { ElasticModule } from 'angular2-elastic';
import { ClipboardModule } from 'ngx-clipboard/dist';

@NgModule({
    declarations: [
        ConfirmTxPage,
    ],
    imports: [
        IonicPageModule.forChild(ConfirmTxPage),
        ReactiveFormsModule,
        FormsModule,
        TranslateModule,
        ElasticModule,
        ClipboardModule,
        TxItemModule,
    ],
    providers: [
        AlertProvider,
    ],
})
export class ConfirmTxPageModule { }
