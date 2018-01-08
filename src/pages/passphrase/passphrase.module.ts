import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PassphrasePage } from './passphrase'
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        PassphrasePage,
    ],
    imports: [
        IonicPageModule.forChild(PassphrasePage),
        TranslateModule
    ],
    entryComponents: [
    ],
    exports: [
        PassphrasePage
    ]
})
export class PassphrasePageModule { }
