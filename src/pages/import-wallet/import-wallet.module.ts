import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImportWalletPage } from './import-wallet';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        ImportWalletPage,
    ],
    imports: [
        IonicPageModule.forChild(ImportWalletPage),
        TranslateModule
    ],
    exports: [
        ImportWalletPage
    ]
})
export class ImportWalletPageModule { }
