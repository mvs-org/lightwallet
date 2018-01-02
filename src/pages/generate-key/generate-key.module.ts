import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GenerateKeyPage } from './generate-key';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        GenerateKeyPage,
    ],
    imports: [
        IonicPageModule.forChild(GenerateKeyPage),
        TranslateModule
    ],
    exports: [
        GenerateKeyPage
    ]
})
export class GenerateKeyPageModule { }
