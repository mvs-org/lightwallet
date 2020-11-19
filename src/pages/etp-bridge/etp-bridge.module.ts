import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EtpBridgePage } from './etp-bridge';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { TranslateModule} from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';
import { EtpBridgeServiceProvider } from '../../providers/etp-bridge-service/etp-bridge-service';

@NgModule({
  declarations: [
    EtpBridgePage,
  ],
  imports: [
    IonicPageModule.forChild(EtpBridgePage),
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    PipesModule,
  ],
  providers:[
    BarcodeScanner,
    AlertProvider,
    EtpBridgeServiceProvider,
],
})
export class EtpBridgePageModule {}
