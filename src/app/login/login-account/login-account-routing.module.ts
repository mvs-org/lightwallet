import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginAccountPage } from './login-account.page';

const routes: Routes = [
  {
    path: '',
    component: LoginAccountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginAccountPageRoutingModule {}
