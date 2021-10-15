import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PassphrasePageRoutingModule } from './passphrase-routing.module';

import { PassphrasePage } from './passphrase.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    PassphrasePageRoutingModule
  ],
  declarations: [PassphrasePage]
})
export class PassphrasePageModule {}
