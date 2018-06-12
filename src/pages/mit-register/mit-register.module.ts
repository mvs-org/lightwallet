import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MITRegisterPage } from './mit-register';
import { TranslateModule } from '@ngx-translate/core';
import { FormatPipe } from '../../pipes/format/format';

@NgModule({
    declarations: [
        MITRegisterPage,
        FormatPipe
    ],
    imports: [
        IonicPageModule.forChild(MITRegisterPage),
        TranslateModule
    ],
})
export class MitRegisterPageModule { }
