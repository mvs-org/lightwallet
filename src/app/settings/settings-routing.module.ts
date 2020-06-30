import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { SettingsPage } from './settings.page'

const routes: Routes = [
  {
    path: '',
    component: SettingsPage
  },
  {
    path: 'language',
    loadChildren: () => import('./language/language.module').then( m => m.LanguagePageModule)
  },
  {
    path: 'export-mobile',
    loadChildren: () => import('./export-mobile/export-mobile.module').then( m => m.ExportMobilePageModule)
  },
  {
    path: 'export-xpub',
    loadChildren: () => import('./export-mobile/export-mobile.module').then( m => m.ExportMobilePageModule)
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule {}
