import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImportWalletPage } from './import-wallet';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        ImportWalletPage,
    ],
    imports: [
        IonicPageModule.forChild(ImportWalletPage),
        TranslateModule
    ],
    providers:[
        AlertProvider,
    ],
    exports: [
        ImportWalletPage
    ]
})
export class ImportWalletPageModule { }
