import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MultisignaturePage } from './multisignature';
import { TranslateModule} from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Keyboard } from '@ionic-native/keyboard';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        MultisignaturePage
    ],
    imports: [
        IonicPageModule.forChild(MultisignaturePage),
        PipesModule,
        TranslateModule
    ],
    providers:[
        BarcodeScanner,
        Keyboard,
        AlertProvider
    ],
    exports: [
        MultisignaturePage
    ]
})
export class MultisignaturePageModule { }
