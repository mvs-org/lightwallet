import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login'
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        LoginPage,
    ],
    imports: [
        IonicPageModule.forChild(LoginPage),
        TranslateModule
    ],
    providers:[
        AlertProvider
    ],
    exports: [
        LoginPage,
    ],
})
export class LoginPageModule { }
