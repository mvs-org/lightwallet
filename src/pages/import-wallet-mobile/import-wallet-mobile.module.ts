import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImportWalletMobilePage } from './import-wallet-mobile';
import { AppGlobals } from '../../app/app.global';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        ImportWalletMobilePage,
    ],
    imports: [
        IonicPageModule.forChild(ImportWalletMobilePage),
        TranslateModule
    ],
    providers:[
        BarcodeScanner,
        AppGlobals,
        AlertProvider,
    ],
    exports: [
        ImportWalletMobilePage
    ]
})
export class ImportWalletMobilePageModule { }
