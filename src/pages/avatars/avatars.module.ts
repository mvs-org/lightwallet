import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AvatarsPage } from './avatars';
import { TranslateModule} from '@ngx-translate/core';
import { ClipboardModule } from 'ngx-clipboard/dist';

@NgModule({
  declarations: [
    AvatarsPage,
  ],
  imports: [
    IonicPageModule.forChild(AvatarsPage),
    TranslateModule,
    ClipboardModule
  ],
})
export class AvatarsPageModule {}
