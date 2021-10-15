import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HowtoPageRoutingModule } from './howto-routing.module';

import { HowtoPage } from './howto.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    HowtoPageRoutingModule
  ],
  declarations: [HowtoPage]
})
export class HowtoPageModule {}
