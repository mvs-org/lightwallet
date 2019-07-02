import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfirmTxPage } from './confirm-tx';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { TranslateModule} from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { AlertProvider } from '../../providers/alert/alert';
import { TxItemComponent } from '../../components/tx-item/tx-item';
import { InputItemComponent } from '../../components/input-item/input-item';
import { OutputItemComponent } from '../../components/output-item/output-item';

@NgModule({
  declarations: [
    ConfirmTxPage,
    TxItemComponent,
    InputItemComponent,
    OutputItemComponent
  ],
  imports: [
    IonicPageModule.forChild(ConfirmTxPage),
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    PipesModule,
  ],
  providers:[
    AlertProvider,
  ],
})
export class ConfirmTxPageModule {}
