import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddPageRoutingModule } from './add-routing.module';

import { AddPage } from './add.page';
import { TranslateModule } from '@ngx-translate/core'
import { PipesModule } from '../../../pipes/pipes.module'
import { ClipboardModule } from 'ngx-clipboard'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    ClipboardModule,
    TranslateModule.forChild(),
    AddPageRoutingModule
  ],
  declarations: [AddPage]
})
export class AddPageModule {}
