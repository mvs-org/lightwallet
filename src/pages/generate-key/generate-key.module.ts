import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GenerateKeyPage } from './generate-key';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        GenerateKeyPage,
    ],
    imports: [
        IonicPageModule.forChild(GenerateKeyPage),
        TranslateModule
    ],
    providers:[
        AlertProvider,
    ],
    exports: [
        GenerateKeyPage
    ]
})
export class GenerateKeyPageModule { }
