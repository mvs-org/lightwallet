import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReportPage } from './report';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        ReportPage,
    ],
    imports: [
        IonicPageModule.forChild(ReportPage),
        TranslateModule
    ],
})
export class ReportPageModule { }
