import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceivePage } from './receive';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        ReceivePage
    ],
    imports: [
        IonicPageModule.forChild(ReceivePage),
        TranslateModule
    ],
    exports: [
        ReceivePage
    ]
})
export class ReceivePageModule { }
