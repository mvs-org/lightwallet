import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DepositPage } from './deposit';
import { TranslateModule} from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Keyboard } from '@ionic-native/keyboard';

@NgModule({
    declarations: [
        DepositPage,
    ],
    imports: [
        IonicPageModule.forChild(DepositPage),
        TranslateModule
    ],
    providers:[
        BarcodeScanner,
        Keyboard
    ],
    exports: [
        DepositPage
    ]
})
export class DepositPageModule { }
