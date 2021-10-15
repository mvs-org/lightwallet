import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginXpubPage } from './login-xpub.page';

const routes: Routes = [
  {
    path: '',
    component: LoginXpubPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginXpubPageRoutingModule {}
