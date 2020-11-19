import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HowToAuthPage } from './how-to-auth';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        HowToAuthPage,
    ],
    imports: [
        IonicPageModule.forChild(HowToAuthPage),
        TranslateModule
    ],
    exports: [
        HowToAuthPage
    ]
})
export class HowToAuthPageModule { }
