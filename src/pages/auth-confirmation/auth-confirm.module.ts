import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AuthConfirmPage } from './auth-confirm';
import { AppGlobals } from '../../app/app.global';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { CountdownModule } from 'ngx-countdown';

@NgModule({
    declarations: [
        AuthConfirmPage,
    ],
    imports: [
        IonicPageModule.forChild(AuthConfirmPage),
        TranslateModule,
        CountdownModule,
    ],
    providers:[
        AppGlobals,
        AlertProvider,
        AuthServiceProvider,
    ],
    exports: [
        AuthConfirmPage
    ]
})
export class AuthConfirmPageModule { }
