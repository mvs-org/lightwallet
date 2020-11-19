import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PassphrasePage } from './passphrase'
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        PassphrasePage,
    ],
    imports: [
        IonicPageModule.forChild(PassphrasePage),
        TranslateModule
    ],
    providers:[
        AlertProvider,
    ],
    exports: [
        PassphrasePage
    ]
})
export class PassphrasePageModule { }
