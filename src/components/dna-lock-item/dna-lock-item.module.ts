import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule} from '@ngx-translate/core';
import { DnaLockItemComponent } from './dna-lock-item';
import { PipesModule } from '../../pipes/pipes.module';
import { ElasticModule } from 'angular2-elastic';
import { ClipboardModule } from 'ngx-clipboard/dist';

@NgModule({
	declarations: [
        DnaLockItemComponent,
	],
	imports: [
		IonicPageModule,
		TranslateModule,
		PipesModule,
		ElasticModule,
		ClipboardModule,
	],
	exports: [
        DnaLockItemComponent,
	]
})
export class DnaLockItemModule {}
