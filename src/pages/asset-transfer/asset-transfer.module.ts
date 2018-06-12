import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssetTransferPage } from './asset-transfer';
import { TranslateModule} from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Keyboard } from '@ionic-native/keyboard';
import { FormatPipe } from '../../pipes/format/format';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        AssetTransferPage,
        FormatPipe
    ],
    imports: [
        IonicPageModule.forChild(AssetTransferPage),
        TranslateModule
    ],
    providers:[
        BarcodeScanner,
        Keyboard,
        AlertProvider
    ],
    exports: [
        AssetTransferPage
    ]
})
export class AssetTransferPageModule { }
