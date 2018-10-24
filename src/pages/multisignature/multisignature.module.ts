import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MultisignaturePage } from './multisignature';
import { TranslateModule} from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        MultisignaturePage
    ],
    imports: [
        IonicPageModule.forChild(MultisignaturePage),
        PipesModule,
        TranslateModule
    ],
    providers: [
        AlertProvider
    ],
    exports: [
        MultisignaturePage
    ]
})
export class MultisignaturePageModule { }
