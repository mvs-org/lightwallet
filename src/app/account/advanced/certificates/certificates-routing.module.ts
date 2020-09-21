import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CertificatesPage } from './certificates.page';

const routes: Routes = [
  {
    path: '',
    component: CertificatesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CertificatesPageRoutingModule {}
