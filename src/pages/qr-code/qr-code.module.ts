import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QRCodePage } from './qr-code'
import { TranslateModule} from '@ngx-translate/core';
import { QRCodeModule } from 'angular2-qrcode';

@NgModule({
    declarations: [
        QRCodePage
    ],
    imports: [
        IonicPageModule.forChild(QRCodePage),
        QRCodeModule,
        TranslateModule,
    ],
    providers:[

    ],
    entryComponents: [
        QRCodePage
    ]
})
export class QRCodePageModule { }
