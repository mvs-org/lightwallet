import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QRCodePage } from './qr-code'
import { TranslateModule} from '@ngx-translate/core';
import { QRCodeModule } from 'angular2-qrcode';
import { ElasticModule } from 'angular2-elastic';

@NgModule({
    declarations: [
        QRCodePage
    ],
    imports: [
        IonicPageModule.forChild(QRCodePage),
        QRCodeModule,
        TranslateModule,
        ElasticModule,
    ],
    providers:[

    ],
    entryComponents: [
        QRCodePage
    ]
})
export class QRCodePageModule { }
