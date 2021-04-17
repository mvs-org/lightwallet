import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OpenPage } from './open.page';

const routes: Routes = [
  {
    path: '',
    component: OpenPage
  },
  {
    path: 'xpub',
    loadChildren: () => import('./login-xpub/login-xpub.module').then( m => m.LoginXpubPageModule)
  },
  {
    path: 'qr',
    loadChildren: () => import('./open-qr/open-qr.module').then( m => m.OpenQrPageModule)
  },
  {
    path: 'file',
    loadChildren: () => import('./open-file/open-file.module').then( m => m.OpenFilePageModule)
  },
  {
    path: 'backup-words',
    loadChildren: () => import('./import-backup/import-backup.module').then( m => m.ImportBackupPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OpenPageRoutingModule {}
