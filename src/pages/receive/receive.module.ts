import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceivePage } from './receive';
import { TranslateModule} from '@ngx-translate/core';
import { ClipboardModule } from 'ngx-clipboard/dist';

@NgModule({
    declarations: [
        ReceivePage
    ],
    imports: [
        IonicPageModule.forChild(ReceivePage),
        TranslateModule,
        ClipboardModule,
    ],
    exports: [
        ReceivePage
    ]
})
export class ReceivePageModule { }
