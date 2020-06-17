import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { AppComponent } from '../app.component'
import { AccountPage } from './account.page'

const routes: Routes = [
  {
    path: '',
    component: AccountPage,
    children: [
      {
        path: 'history',
        loadChildren: () => import('./history/history.module').then(m => m.HistoryPageModule)
      },
      {
        path: 'addresses',
        loadChildren: () => import('./addresses/addresses.module').then(m => m.AddressesPageModule)
      },
      {
        path: 'send',
        loadChildren: () => import('./send/send.module').then(m => m.SendPageModule)
      },
      {
        path: 'mst',
        loadChildren: () => import('./mst/mst.module').then( m => m.MstPageModule)
      },
      {
        path: 'mit',
        loadChildren: () => import('./mit/mit.module').then( m => m.MitPageModule)
      },
      {
        path: 'portfolio',
        loadChildren: () => import('./portfolio/portfolio.module').then(m => m.PortfolioPageModule)
      },
      {
        path: 'export-xpub',
        loadChildren: () => import('./export-xpub/export-xpub.module').then( m => m.ExportXpubPageModule)
      },
      {
        path: 'confirm',
        loadChildren: () => import('./confirm/confirm.module').then( m => m.ConfirmPageModule)
      },
      {
        path: 'avatar',
        loadChildren: () => import('./avatar/avatar.module').then( m => m.AvatarPageModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then( m => m.SettingsPageModule)
      },
    ]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountPageRoutingModule { }
