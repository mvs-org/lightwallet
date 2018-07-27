import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceivePage } from './receive';
import { TranslateModule} from '@ngx-translate/core';
import { QRCodeModule } from 'angular2-qrcode';
import { ClipboardModule } from 'ngx-clipboard/dist';

@NgModule({
    declarations: [
        ReceivePage
    ],
    imports: [
        IonicPageModule.forChild(ReceivePage),
        TranslateModule,
        QRCodeModule,
        ClipboardModule
    ],
    exports: [
        ReceivePage
    ]
})
export class ReceivePageModule { }
