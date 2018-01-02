import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InformationPage } from './information';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        InformationPage,
    ],
    imports: [
        IonicPageModule.forChild(InformationPage),
        TranslateModule
    ],
    exports: [
        InformationPage
    ]
})
export class InformationPageModule { }
