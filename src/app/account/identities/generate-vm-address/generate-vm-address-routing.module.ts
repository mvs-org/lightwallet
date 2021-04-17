import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GenerateVmAddressPage } from './generate-vm-address.page';

const routes: Routes = [
  {
    path: '',
    component: GenerateVmAddressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GenerateVmAddressPageRoutingModule {}
