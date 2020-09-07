import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MultisigPageRoutingModule } from './multisig-routing.module';

import { MultisigPage } from './multisig.page';
import { TranslateModule } from '@ngx-translate/core'
import { PipesModule } from '../../pipes/pipes.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    PipesModule,
    MultisigPageRoutingModule
  ],
  declarations: [MultisigPage]
})
export class MultisigPageModule {}
