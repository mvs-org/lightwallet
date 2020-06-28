import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HowtoPage } from './howto.page';

const routes: Routes = [
  {
    path: '',
    component: HowtoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HowtoPageRoutingModule {}
