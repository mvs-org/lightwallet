import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MultisignatureAddPage } from './multisignature-add';
import { TranslateModule} from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { AlertProvider } from '../../providers/alert/alert';
import { ClipboardModule } from 'ngx-clipboard/dist';
import { ElasticModule } from 'angular2-elastic';

@NgModule({
    declarations: [
        MultisignatureAddPage
    ],
    imports: [
        IonicPageModule.forChild(MultisignatureAddPage),
        PipesModule,
        TranslateModule,
        ClipboardModule,
        ElasticModule
    ],
    providers:[
        AlertProvider
    ],
    exports: [
        MultisignatureAddPage
    ]
})
export class MultisignatureAddPageModule { }
