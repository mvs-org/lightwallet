import { NgModule } from '@angular/core';
import { AlertProvider } from '../../providers/alert/alert';
import { IonicPageModule } from 'ionic-angular';
import { PluginPage } from './plugin';

@NgModule({
    declarations: [
        PluginPage,
    ],
    imports: [
        IonicPageModule.forChild(PluginPage),
    ],
    providers: [
        AlertProvider
    ],
})
export class PluginPageModule { }
