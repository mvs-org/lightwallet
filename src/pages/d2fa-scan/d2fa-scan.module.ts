import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { D2faScanPage } from './d2fa-scan';
import { AppGlobals } from '../../app/app.global';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        D2faScanPage,
    ],
    imports: [
        IonicPageModule.forChild(D2faScanPage),
        TranslateModule
    ],
    providers:[
        BarcodeScanner,
        AppGlobals,
        AlertProvider,
    ],
    exports: [
        D2faScanPage
    ]
})
export class ImportWalletMobilePageModule { }
