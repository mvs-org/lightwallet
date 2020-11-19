import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExportWalletPage } from './export-wallet';

import { TranslateModule} from '@ngx-translate/core';
import { QRCodeModule } from 'angular2-qrcode';

@NgModule({
    declarations: [
        ExportWalletPage,
    ],
    imports: [
        IonicPageModule.forChild(ExportWalletPage),
        TranslateModule,
        QRCodeModule
    ],
    exports: [
        ExportWalletPage
    ]
})
export class ExportWalletPageModule { }
