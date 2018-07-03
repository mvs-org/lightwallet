import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PluginPage } from './plugin';

@NgModule({
  declarations: [
    PluginPage,
  ],
  imports: [
    IonicPageModule.forChild(PluginPage),
  ],
})
export class PluginPageModule {}
