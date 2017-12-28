import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HowToMobilePage } from './how-to-mobile';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        HowToMobilePage,
    ],
    imports: [
        IonicPageModule.forChild(HowToMobilePage),
        TranslateModule
    ],
    exports: [
        HowToMobilePage
    ]
})
export class HowToMobilePageModule { }
