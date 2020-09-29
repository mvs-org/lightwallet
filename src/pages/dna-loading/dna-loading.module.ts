import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DnaLoadingPage } from './dna-loading'
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';
import { ProgressBarModule } from 'angular-progress-bar';

@NgModule({
    declarations: [
        DnaLoadingPage,
    ],
    imports: [
        IonicPageModule.forChild(DnaLoadingPage),
        PipesModule,
        TranslateModule,
        ProgressBarModule,
    ],
    providers:[
        AlertProvider,
    ],
    exports: [
        DnaLoadingPage,
    ]
})
export class DnaLoadingPageModule { }
