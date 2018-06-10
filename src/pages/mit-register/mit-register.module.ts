import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MITRegisterPage } from './mit-register';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        MITRegisterPage,
    ],
    imports: [
        IonicPageModule.forChild(MITRegisterPage),
        TranslateModule
    ],
})
export class MitRegisterPageModule { }
