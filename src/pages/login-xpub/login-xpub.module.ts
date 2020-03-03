import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginXpubPage } from './login-xpub'
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        LoginXpubPage,
    ],
    imports: [
        IonicPageModule.forChild(LoginXpubPage),
        TranslateModule
    ],
    providers:[
        AlertProvider
    ],
    entryComponents: [
    ],
    exports: [
        LoginXpubPage
    ]
})
export class LoginXpubPageModule { }
