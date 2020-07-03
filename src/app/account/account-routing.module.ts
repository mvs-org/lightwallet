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
                path: 'avatar',
                loadChildren: () => import('./avatar/avatar.module').then(m => m.AvatarPageModule)
            },
            {
                path: 'settings',
                loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
            },
            {
                path: 'certificates',
                loadChildren: () => import('./certificates/certificates.module').then(m => m.CertificatesPageModule)
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
                path: 'multisig',
                loadChildren: () => import('./multisig/multisig.module').then(m => m.MultisigPageModule)
            },
        ]
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AccountPageRoutingModule { }
