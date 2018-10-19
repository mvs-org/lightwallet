import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginAccountPage } from './login-account'
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        LoginAccountPage,
    ],
    imports: [
        IonicPageModule.forChild(LoginAccountPage),
        TranslateModule
    ],
    providers:[
        AlertProvider
    ],
    entryComponents: [
    ],
    exports: [
        LoginAccountPage
    ]
})
export class LoginAccountPageModule { }
