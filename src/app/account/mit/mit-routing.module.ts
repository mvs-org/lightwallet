import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MitPage } from './mit.page';

const routes: Routes = [
  {
    path: '',
    component: MitPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MitPageRoutingModule {}
