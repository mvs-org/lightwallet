import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EthBridgePage } from './eth-bridge';
import { TranslateModule} from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { PipesModule } from '../../pipes/pipes.module';
import { ClipboardModule } from 'ngx-clipboard/dist';
import { ElasticModule } from 'angular2-elastic';

@NgModule({
    declarations: [
        EthBridgePage
    ],
    imports: [
        IonicPageModule.forChild(EthBridgePage),
        PipesModule,
        TranslateModule,
        ClipboardModule,
        ElasticModule
    ],
    providers:[
        BarcodeScanner
    ],
    exports: [
        EthBridgePage
    ]
})
export class EthBridgePageModule { }
