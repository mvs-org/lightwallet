import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MultisignaturePage } from './multisignature';
import { TranslateModule} from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';

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

    ],
    exports: [
        MultisignaturePage
    ]
})
export class MultisignaturePageModule { }
