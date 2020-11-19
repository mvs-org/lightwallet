import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReorderPage } from './reorder';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
    declarations: [
        ReorderPage,
    ],
    imports: [
        IonicPageModule.forChild(ReorderPage),
        TranslateModule
    ],
    providers: [
        AlertProvider
    ],
    exports: [
        ReorderPage,
    ]
})
export class ReorderPageModule { }
