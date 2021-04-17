import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExportPrivateKeyVmPage } from './export-private-key-vm.page';

const routes: Routes = [
  {
    path: '',
    component: ExportPrivateKeyVmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportPrivateKeyVmPageRoutingModule {}
