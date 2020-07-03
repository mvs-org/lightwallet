import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OpenQrPage } from './open-qr.page';

const routes: Routes = [
  {
    path: '',
    component: OpenQrPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OpenQrPageRoutingModule {}
