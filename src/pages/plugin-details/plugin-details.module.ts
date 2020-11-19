import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PluginDetailsPage } from './plugin-details';
import { AlertProvider } from '../../providers/alert/alert';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        PluginDetailsPage
    ],
    imports: [
        IonicPageModule.forChild(PluginDetailsPage),
        TranslateModule
    ],
    providers: [
        AlertProvider
    ]
})
export class PluginDetailsPageModule { }
