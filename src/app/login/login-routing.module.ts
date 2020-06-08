import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPage } from './login.page';

const routes: Routes = [
  {
    path: '',
    component: LoginPage
  },
  {
    path: 'create',
    loadChildren: () => import('./create/create.module').then( m => m.CreatePageModule)
  },
  {
    path: 'passphrase',
    loadChildren: () => import('./passphrase/passphrase.module').then( m => m.PassphrasePageModule)
  },
  {
    path: 'open-file',
    loadChildren: () => import('./open-file/open-file.module').then( m => m.OpenFilePageModule)
  },
  {
    path: 'import-backup',
    loadChildren: () => import('./import-backup/import-backup.module').then( m => m.ImportBackupPageModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./login-account/login-account.module').then( m => m.LoginAccountPageModule)
  },
  {
    path: 'xpub',
    loadChildren: () => import('./login-xpub/login-xpub.module').then( m => m.LoginXpubPageModule)
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginPageRoutingModule {}
