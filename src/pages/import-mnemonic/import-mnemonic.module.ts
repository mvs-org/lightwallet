import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImportMnemonicPage } from './import-mnemonic';
import { TranslateModule} from '@ngx-translate/core';
import { ElasticModule } from 'angular2-elastic';

@NgModule({
    declarations: [
        ImportMnemonicPage,
    ],
    imports: [
        IonicPageModule.forChild(ImportMnemonicPage),
        TranslateModule,
        ElasticModule
    ],
    exports: [
        ImportMnemonicPage
    ]
})
export class ImportMnemonicPageModule { }
