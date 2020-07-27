import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GenerateAddressPage } from './generate-address.page';

const routes: Routes = [
  {
    path: '',
    component: GenerateAddressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GenerateAddressPageRoutingModule {}
