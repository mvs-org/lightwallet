import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssetTransferPage } from './asset-transfer';
import { TranslateModule} from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@NgModule({
    declarations: [
        AssetTransferPage,
    ],
    imports: [
        IonicPageModule.forChild(AssetTransferPage),
        TranslateModule
    ],
    providers:[
        BarcodeScanner
    ],
    exports: [
        AssetTransferPage
    ]
})
export class AssetTransferPageModule { }
