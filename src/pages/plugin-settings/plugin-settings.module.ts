import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PluginSettingsPage } from './plugin-settings';
import { PluginItemComponent } from '../../components/plugin-item/plugin-item';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        PluginItemComponent,
        PluginSettingsPage,
    ],
    imports: [
        IonicPageModule.forChild(PluginSettingsPage),
    ],
    providers: [
        AlertProvider
    ]
})
export class PluginSettingsPageModule { }
