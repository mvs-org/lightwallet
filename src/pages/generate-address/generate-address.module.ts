import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GenerateAddressPage } from './generate-address';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        GenerateAddressPage,
    ],
    imports: [
        IonicPageModule.forChild(GenerateAddressPage),
        TranslateModule,
    ],
    providers:[
        AlertProvider
    ]
})
export class GenerateAddressPageModule { }
