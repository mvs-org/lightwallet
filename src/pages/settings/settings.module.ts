import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsPage } from './settings';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        SettingsPage,
    ],
    imports: [
        IonicPageModule.forChild(SettingsPage),
        TranslateModule
    ],
    providers: [
        AlertProvider
    ],
    exports: [
        SettingsPage
    ]
})
export class SettingsPageModule { }
