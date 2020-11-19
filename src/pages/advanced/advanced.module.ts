import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdvancedPage } from './advanced';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        AdvancedPage,
    ],
    imports: [
        IonicPageModule.forChild(AdvancedPage),
        TranslateModule
    ],
    providers: [
        AlertProvider
    ],
    exports: [
        AdvancedPage
    ]
})
export class AdvancedPageModule { }
