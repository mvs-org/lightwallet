import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DepositPage } from './deposit';
import { TranslateModule} from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Keyboard } from '@ionic-native/keyboard';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        DepositPage,
    ],
    imports: [
        IonicPageModule.forChild(DepositPage),
        PipesModule,
        TranslateModule
    ],
    providers:[
        BarcodeScanner,
        Keyboard,
        AlertProvider
    ],
    exports: [
        DepositPage
    ]
})
export class DepositPageModule { }
