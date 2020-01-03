import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule} from '@ngx-translate/core';
import { VoteItemComponent } from './vote-item';
import { PipesModule } from '../../pipes/pipes.module';
import { ProgressBarModule } from 'angular-progress-bar';

@NgModule({
	declarations: [
		VoteItemComponent,
	],
	imports: [
		IonicPageModule,
		TranslateModule,
		PipesModule,
		ProgressBarModule,
	],
	exports: [
		VoteItemComponent,
	]
})
export class VoteItemModule {}
