import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExportXpubPage } from './export-xpub';
import { AlertProvider } from '../../providers/alert/alert';
import { TranslateModule} from '@ngx-translate/core';
import { ClipboardModule } from 'ngx-clipboard/dist';

@NgModule({
  declarations: [
    ExportXpubPage,
  ],
  providers: [
    AlertProvider
  ],
  imports: [
    IonicPageModule.forChild(ExportXpubPage),
    TranslateModule,
    ClipboardModule,
  ],
})
export class ExportXpubPageModule { }
