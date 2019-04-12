import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BuyEtpPage } from './buy-etp';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { TranslateModule} from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    BuyEtpPage,
  ],
  imports: [
    IonicPageModule.forChild(BuyEtpPage),
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    PipesModule,
  ],
  providers:[
    BarcodeScanner,
    AlertProvider
],
})
export class BuyEtpPageModule {}
