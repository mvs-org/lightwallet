import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AvatarsPage } from './avatars';

@NgModule({
  declarations: [
    AvatarsPage,
  ],
  imports: [
    IonicPageModule.forChild(AvatarsPage),
  ],
})
export class AvatarsPageModule {}
