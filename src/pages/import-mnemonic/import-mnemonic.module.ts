import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImportMnemonicPage } from './import-mnemonic';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        ImportMnemonicPage,
    ],
    imports: [
        IonicPageModule.forChild(ImportMnemonicPage),
        TranslateModule
    ],
    exports: [
        ImportMnemonicPage
    ]
})
export class ImportMnemonicPageModule { }
