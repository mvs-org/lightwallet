import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AboutPage } from './about';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        AboutPage
    ],
    imports: [
        IonicPageModule.forChild(AboutPage),
        TranslateModule
    ],
    exports: [
        AboutPage
    ]
})
export class SettingsPageModule { }
