import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DisclaimerPage } from './disclaimer';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        DisclaimerPage,
    ],
    imports: [
        IonicPageModule.forChild(DisclaimerPage),
        TranslateModule
    ],
})
export class DisclaimerPageModule { }
