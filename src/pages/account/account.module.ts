import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccountPage } from './account'
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        AccountPage,
    ],
    imports: [
        IonicPageModule.forChild(AccountPage),
        TranslateModule,
    ],
    exports: [
        AccountPage
    ]
})
export class AccountPageModule { }
