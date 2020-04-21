import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'
import { WalletGuard } from './guards/wallet.guard'

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'login/create', loadChildren: () => import('./login/create-new-wallet/create-new-wallet.module').then(m => m.CreateNewWalletPageModule) },
  { path: 'login/import-backup', loadChildren: () => import('./login/import-wallet-mnemonic/import-wallet-mnemonic.module').then(m => m.ImportWalletMnemonicPageModule) },
  { path: 'login/open-file', loadChildren: () => import('./login/open-file/open-file.module').then(m => m.OpenFilePageModule) },
  { path: 'login/scan', loadChildren: () => import('./login/scan/scan.module').then(m => m.ScanPageModule) },
  { path: 'login/how-to-import', loadChildren: () => import('./login/help-mobile/help-mobile.module').then(m => m.HelpMobilePageModule) },
  { path: 'login/select-passphrase', loadChildren: () => import('./login/select-passphrase/select-passphrase.module').then(m => m.SelectPassphrasePageModule) },
  { path: 'login/account', loadChildren: () => import('./login/login-account/login-account.module').then(m => m.LoginAccountPageModule) },
  { path: 'news', loadChildren: () => import('./news/news.module').then(m => m.NewsPageModule) },
  {
    path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountPageModule), canActivate: [WalletGuard]
  },
  { path: 'settings', loadChildren: () => import('./settings/settings.module').then(m => m.SettingsPageModule) },
  { path: 'settings/language', loadChildren: () => import('./settings/language/language.module').then(m => m.LanguagePageModule) },
  { path: 'send', loadChildren: () => import('./account/send/send.module').then(m => m.SendPageModule) },
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
