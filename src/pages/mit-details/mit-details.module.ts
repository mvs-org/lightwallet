import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MITDetailsPage } from './mit-details';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        MITDetailsPage,
    ],
    imports: [
        IonicPageModule.forChild(MITDetailsPage),
        TranslateModule
    ],
})
export class MITDetailsPageModule { }
