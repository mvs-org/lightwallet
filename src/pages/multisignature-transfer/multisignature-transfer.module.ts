import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MultisignatureTransferPage } from './multisignature-transfer';
import { TranslateModule} from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Keyboard } from '@ionic-native/keyboard';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';
import { ClipboardModule } from 'ngx-clipboard/dist';
import { ElasticModule } from 'angular2-elastic';

@NgModule({
    declarations: [
        MultisignatureTransferPage
    ],
    imports: [
        IonicPageModule.forChild(MultisignatureTransferPage),
        PipesModule,
        TranslateModule,
        ClipboardModule,
        ElasticModule
    ],
    providers:[
        BarcodeScanner,
        Keyboard,
        AlertProvider
    ],
    exports: [
        MultisignatureTransferPage
    ]
})
export class MultisignatureTransferPageModule { }
