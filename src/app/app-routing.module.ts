import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { WalletGuard } from './guards/wallet.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'login/create', loadChildren: './login/create-new-wallet/create-new-wallet.module#CreateNewWalletPageModule' },
  { path: 'login/import-backup', loadChildren: './login/import-wallet-mnemonic/import-wallet-mnemonic.module#ImportWalletMnemonicPageModule' },
  { path: 'login/open-file', loadChildren: './login/open-file/open-file.module#OpenFilePageModule' },
  { path: 'login/scan', loadChildren: './login/scan/scan.module#ScanPageModule' },
  { path: 'login/how-to-import', loadChildren: './login/help-mobile/help-mobile.module#HelpMobilePageModule' },
  { path: 'login/select-passphrase', loadChildren: './login/select-passphrase/select-passphrase.module#SelectPassphrasePageModule' },
  { path: 'login/account', loadChildren: './login/login-account/login-account.module#LoginAccountPageModule' },
  { path: 'news', loadChildren: './news/news.module#NewsPageModule' },
  {
    path: 'account', loadChildren: './account/account.module#AccountPageModule', canActivate: [WalletGuard]
  },
  { path: 'settings', loadChildren: './settings/settings.module#SettingsPageModule' },
  { path: 'settings/language', loadChildren: './settings/language/language.module#LanguagePageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
