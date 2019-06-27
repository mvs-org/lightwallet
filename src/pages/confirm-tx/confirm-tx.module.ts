import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfirmTxPage } from './confirm-tx';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { TranslateModule} from '@ngx-translate/core';
import { ElasticModule } from 'angular2-elastic';
import { PipesModule } from '../../pipes/pipes.module';
import { AlertProvider } from '../../providers/alert/alert';

@NgModule({
  declarations: [
    ConfirmTxPage,
  ],
  imports: [
    IonicPageModule.forChild(ConfirmTxPage),
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    ElasticModule,
    PipesModule,
  ],
  providers:[
    AlertProvider,
  ],
})
export class ConfirmtxPageModule {}
