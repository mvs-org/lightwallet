import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AuthPage } from './auth';
import { AppGlobals } from '../../app/app.global';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { CountdownModule } from 'ngx-countdown';

@NgModule({
    declarations: [
        AuthPage,
    ],
    imports: [
        IonicPageModule.forChild(AuthPage),
        TranslateModule,
        CountdownModule,
    ],
    providers:[
        BarcodeScanner,
        AppGlobals,
        AlertProvider,
        AuthServiceProvider,
    ],
    exports: [
        AuthPage
    ]
})
export class ImportWalletMobilePageModule { }
