import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MITRegisterPage } from './mit-register';
import { TranslateModule } from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        MITRegisterPage,
    ],
    providers: [
        AlertProvider
    ],
    imports: [
        IonicPageModule.forChild(MITRegisterPage),
        PipesModule,
        TranslateModule
    ],
})
export class MitRegisterPageModule { }
