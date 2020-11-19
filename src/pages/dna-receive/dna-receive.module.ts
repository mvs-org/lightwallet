import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DnaReceivePage } from './dna-receive';
import { TranslateModule} from '@ngx-translate/core';
import { ClipboardModule } from 'ngx-clipboard/dist';
import { QRCodeModule } from 'angular2-qrcode';

@NgModule({
    declarations: [
        DnaReceivePage
    ],
    imports: [
        IonicPageModule.forChild(DnaReceivePage),
        TranslateModule,
        ClipboardModule,
        QRCodeModule,
    ],
    exports: [
        DnaReceivePage
    ]
})
export class DnaReceivePageModule { }
