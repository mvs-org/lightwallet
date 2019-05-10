import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule} from '@ngx-translate/core';
import { MiningModelSelectorComponent } from './mining-model-selector';

@NgModule({
	declarations: [
		MiningModelSelectorComponent
	],
	imports: [
		IonicPageModule,
		TranslateModule
	],
	exports: [
		MiningModelSelectorComponent
	]
})
export class MiningModelModule {}
