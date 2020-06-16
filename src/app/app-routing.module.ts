import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'
import { AccountGuard } from './account.guard'
import { PublicGuard } from './public.guard'

const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        canActivate: [PublicGuard],
        canActivateChild: [PublicGuard],
        loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
    },
    {
        path: 'account',
        canActivate: [AccountGuard],
        canActivateChild: [AccountGuard],
        loadChildren: () => import('./account/account.module').then(m => m.AccountPageModule)
    },
    {
        path: 'loading',
        canActivate: [AccountGuard],
        canActivateChild: [AccountGuard],
        loadChildren: () => import('./loading/loading.module').then(m => m.LoadingPageModule)
    },
]

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
