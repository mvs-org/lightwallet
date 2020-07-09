import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OpenQrPageRoutingModule } from './open-qr-routing.module';

import { OpenQrPage } from './open-qr.page';
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    OpenQrPageRoutingModule
  ],
  declarations: [OpenQrPage]
})
export class OpenQrPageModule {}
