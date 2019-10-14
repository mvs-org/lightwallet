import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExportXpubPage } from './export-xpub';
import { AlertProvider } from '../../providers/alert/alert';
import { TranslateModule } from '@ngx-translate/core';
import { ClipboardModule } from 'ngx-clipboard/dist';
import { ElasticModule } from 'angular2-elastic';

@NgModule({
    declarations: [
        ExportXpubPage,
    ],
    imports: [
        IonicPageModule.forChild(ExportXpubPage),
        TranslateModule,
        ClipboardModule,
        ElasticModule,
    ],
    providers: [
        AlertProvider
    ],
})
export class ExportXpubPageModule { }
