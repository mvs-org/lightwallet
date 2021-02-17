import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
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
                path: 'identities',
                loadChildren: () => import('./identities/identities.module').then(m => m.IdentitiesPageModule)
            },
            {
                path: 'send',
                loadChildren: () => import('./send/send.module').then(m => m.SendPageModule)
            },
            {
                path: 'mst',
                loadChildren: () => import('./mst/mst.module').then(m => m.MstPageModule)
            },
            {
                path: 'mit',
                loadChildren: () => import('./mit/mit.module').then(m => m.MitPageModule)
            },
            {
                path: 'portfolio',
                loadChildren: () => import('./portfolio/portfolio.module').then(m => m.PortfolioPageModule)
            },
            {
                path: 'confirm',
                loadChildren: () => import('./confirm/confirm.module').then(m => m.ConfirmPageModule)
            },
            {
                path: 'settings',
                loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
            },
            {
                path: 'bitident',
                loadChildren: () => import('./bitident/bitident.module').then(m => m.BitidentPageModule)
            },
            {
                path: 'swft',
                loadChildren: () => import('./swft/swft.module').then(m => m.SwftPageModule)
            },
            {
                path: 'advanced',
                loadChildren: () => import('./advanced/advanced.module').then(m => m.AdvancedPageModule)
            },
            {
                path: 'vote',
                loadChildren: () => import('./vote/vote.module').then(m => m.VotePageModule)
            },
            {
                path: 'swap',
                loadChildren: () => import('./swap/swap.module').then(m => m.SwapPageModule)
            },
        ]
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AccountPageRoutingModule { }
