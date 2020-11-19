import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoadingPage } from './loading'
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';
import { ProgressBarModule } from 'angular-progress-bar';

@NgModule({
    declarations: [
        LoadingPage,
    ],
    imports: [
        IonicPageModule.forChild(LoadingPage),
        PipesModule,
        TranslateModule,
        ProgressBarModule,
    ],
    providers:[
        AlertProvider,
    ],
    exports: [
        LoadingPage,
    ]
})
export class LoadingPageModule { }
