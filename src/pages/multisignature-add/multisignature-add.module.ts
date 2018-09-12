import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MultisignatureAddPage } from './multisignature-add';
import { TranslateModule} from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Keyboard } from '@ionic-native/keyboard';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        MultisignatureAddPage
    ],
    imports: [
        IonicPageModule.forChild(MultisignatureAddPage),
        PipesModule,
        TranslateModule
    ],
    providers:[
        BarcodeScanner,
        Keyboard,
        AlertProvider
    ],
    exports: [
        MultisignatureAddPage
    ]
})
export class MultisignatureAddPageModule { }
