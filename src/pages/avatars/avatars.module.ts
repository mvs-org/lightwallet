import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AvatarsPage } from './avatars';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    AvatarsPage,
  ],
  imports: [
    IonicPageModule.forChild(AvatarsPage),
    TranslateModule
  ],
})
export class AvatarsPageModule {}
