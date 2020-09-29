import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule} from '@ngx-translate/core';
import { AttenuationModelSelectorComponent } from './attenuation-model-selector';

@NgModule({
	declarations: [
		AttenuationModelSelectorComponent
	],
	imports: [
		IonicPageModule,
		TranslateModule
	],
	exports: [
		AttenuationModelSelectorComponent
	]
})
export class AttenuationModelModule {}
