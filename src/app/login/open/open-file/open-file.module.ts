import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OpenFilePageRoutingModule } from './open-file-routing.module';

import { OpenFilePage } from './open-file.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    OpenFilePageRoutingModule,
  ],
  declarations: [OpenFilePage]
})
export class OpenFilePageModule {}
