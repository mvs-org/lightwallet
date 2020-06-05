import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoadingPageRoutingModule } from './loading-routing.module';

import { LoadingPage } from './loading.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forChild(),
    IonicModule,
    LoadingPageRoutingModule
  ],
  declarations: [LoadingPage]
})
export class LoadingPageModule {}
