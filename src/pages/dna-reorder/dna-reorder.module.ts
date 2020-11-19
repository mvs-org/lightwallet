import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DnaReorderPage } from './dna-reorder';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        DnaReorderPage,
    ],
    imports: [
        IonicPageModule.forChild(DnaReorderPage),
        TranslateModule
    ],
    providers: [
        AlertProvider
    ],
    exports: [
        DnaReorderPage,
    ]
})
export class DnaReorderPageModule { }
