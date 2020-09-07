import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LegalPageRoutingModule } from './legal-routing.module';

import { LegalPage } from './legal.page';
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forChild(),
    IonicModule,
    LegalPageRoutingModule
  ],
  declarations: [LegalPage]
})
export class LegalPageModule {}
