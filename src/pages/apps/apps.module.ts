import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppsPage } from './apps';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        AppsPage,
    ],
    imports: [
        IonicPageModule.forChild(AppsPage),
        TranslateModule
    ],
    providers: [
        AlertProvider
    ],
    exports: [
        AppsPage
    ]
})
export class AppsPageModule { }
