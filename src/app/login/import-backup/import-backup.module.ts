import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImportBackupPageRoutingModule } from './import-backup-routing.module';

import { ImportBackupPage } from './import-backup.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    ImportBackupPageRoutingModule
  ],
  declarations: [ImportBackupPage]
})
export class ImportBackupPageModule {}
