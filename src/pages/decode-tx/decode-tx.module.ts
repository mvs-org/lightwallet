import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DecodeTxPage } from './decode-tx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule} from '@ngx-translate/core';
import { ElasticModule } from 'angular2-elastic';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
  declarations: [
    DecodeTxPage,
  ],
  imports: [
    IonicPageModule.forChild(DecodeTxPage),
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    ElasticModule,
  ],
  providers:[
    AlertProvider,
  ],
})
export class DecodeTxPageModule {}
