import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImportBackupPage } from './import-backup.page';

const routes: Routes = [
  {
    path: '',
    component: ImportBackupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImportBackupPageRoutingModule {}
