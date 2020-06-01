import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PassphrasePage } from './passphrase.page';

const routes: Routes = [
  {
    path: '',
    component: PassphrasePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PassphrasePageRoutingModule {}
