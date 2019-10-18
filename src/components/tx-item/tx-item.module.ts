import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule} from '@ngx-translate/core';
import { TxItemComponent } from './tx-item';
import { InputItemComponent } from '../../components/input-item/input-item';
import { OutputItemComponent } from '../../components/output-item/output-item';
import { PipesModule } from '../../pipes/pipes.module';
import { ElasticModule } from 'angular2-elastic';
import { ClipboardModule } from 'ngx-clipboard/dist';

@NgModule({
	declarations: [
		InputItemComponent,
		OutputItemComponent,
		TxItemComponent,
	],
	imports: [
		IonicPageModule,
		TranslateModule,
		PipesModule,
		ElasticModule,
		ClipboardModule,
	],
	exports: [
		TxItemComponent,
	]
})
export class TxItemModule {}
