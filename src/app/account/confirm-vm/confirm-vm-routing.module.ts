import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmVmPage } from './confirm-vm.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmVmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmVmPageRoutingModule {}
