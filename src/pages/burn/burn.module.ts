import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BurnPage } from './burn';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        BurnPage
    ],
    imports: [
        IonicPageModule.forChild(BurnPage),
        PipesModule,
        TranslateModule
    ],
    providers:[
        AlertProvider
    ],
    exports: [
        BurnPage
    ]
})
export class BurnPageModule { }
