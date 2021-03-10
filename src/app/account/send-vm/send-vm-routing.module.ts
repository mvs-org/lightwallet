import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SendVmPage } from './send-vm.page';

const routes: Routes = [
  {
    path: ':symbol',
    component: SendVmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SendVmPageRoutingModule {}
