import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DepositPage } from './deposit';
import { TranslateModule} from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Keyboard } from '@ionic-native/keyboard';
//import { Clipboard } from '@ionic-native/clipboard';

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
        Keyboard//,
        //Clipboard
    ],
    exports: [
        DepositPage
    ]
})
export class DepositPageModule { }
