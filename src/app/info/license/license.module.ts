import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LicensePageRoutingModule } from './license-routing.module';

import { LicensePage } from './license.page';
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forChild(),
    IonicModule,
    LicensePageRoutingModule
  ],
  declarations: [LicensePage]
})
export class LicensePageModule {}
