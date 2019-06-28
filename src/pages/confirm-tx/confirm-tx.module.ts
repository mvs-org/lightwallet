import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfirmTxPage } from './confirm-tx';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { TranslateModule} from '@ngx-translate/core';
import { ElasticModule } from 'angular2-elastic';
import { PipesModule } from '../../pipes/pipes.module';
import { AlertProvider } from '../../providers/alert/alert';
import { InputItemComponent } from '../../components/input-item/input-item';
import { OutputItemComponent } from '../../components/output-item/output-item';

@NgModule({
  declarations: [
    ConfirmTxPage,
    InputItemComponent,
    OutputItemComponent
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
