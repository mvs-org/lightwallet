import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PluginStartPage } from './plugin-start';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        PluginStartPage
    ],
    imports: [
        IonicPageModule.forChild(PluginStartPage),
        TranslateModule
    ],
    providers: [

    ]
})
export class PluginStartPageModule { }
