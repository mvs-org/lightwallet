import { Component, OnInit, OnDestroy } from '@angular/core'
import { MetaverseService } from '../services/metaverse.service'
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { Platform } from '@ionic/angular'
import { WalletService } from '../services/wallet.service'
import { LogoutService } from '../services/logout.service'
import { filter } from 'rxjs/operators'
import { Subscription } from 'rxjs'
import { AppService } from '../services/app.service'

interface MenuItem {
    title: string
    url: string
    icon?: string
    selected?: boolean
}
@Component({
    selector: 'app-account',
    templateUrl: './account.page.html',
    styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit, OnDestroy {

    private syncinterval: any

    private syncing = false
    private syncingSmall = false

    height: number
    offline = false
    hasSeed: boolean
    public selectedIndex = 0

    public appItems: MenuItem[] = [
        {
            title: 'BITIDENT.MENU_ENTRY',
            url: '/account/bitident',
            icon: 'finger-print'
        },
        {
            title: 'SWFT.MENU_ENTRY',
            url: '/account/swft',
            icon: 'swap-horizontal'
        },
    ]
    public footerItems: MenuItem[] = [
        {
            title: 'SETTINGS.MENU_ENTRY',
            url: '/account/settings',
            icon: 'cog'
        },
    ]
    public mainItems: MenuItem[] = [
        {
            title: 'ACCOUNT.MENU_ENTRY',
            url: '/account/portfolio',
            icon: 'home',
            selected: false
        },
        {
            title: 'IDENTITIES.MENU_ENTRY',
            url: '/account/identities',
            icon: 'person'
        },
        {
            title: 'MST.MENU_ENTRY',
            url: '/account/mst',
            icon: 'globe'
        },
        {
            title: 'MIT.MENU_ENTRY',
            url: '/account/mit',
            icon: 'create'
        },
        {
            title: 'CERTIFICATES.MENU_ENTRY',
            url: '/account/certificates',
            icon: 'receipt'
        },
        {
            title: 'HISTORY.MENU_ENTRY',
            url: '/account/history',
            icon: 'time'
        },
        {
            title: 'MULTISIG.MENU_ENTRY',
            url: '/account/multisig',
            icon: 'people'
        },
    ]

    private readySubscription$: Subscription
    private routerSubscription$: Subscription

    constructor(
        private metaverseService: MetaverseService,
        public platform: Platform,
        private walletService: WalletService,
        private router: Router,
        private logoutService: LogoutService,
        public globals: AppService,
    ) {
        this.routerSubscription$ = this.router.events
            .pipe(
                filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            )
            .subscribe((change) => {
                this.appItems.forEach(item => {
                    if (change.url.startsWith(item.url)) {
                        item.selected = true
                    } else {
                        item.selected = false
                    }
                })
                this.mainItems.forEach(item => {
                    if (change.url.startsWith(item.url)) {
                        item.selected = true
                    } else {
                        item.selected = false
                    }
                })
                this.footerItems.forEach(item => {
                    if (change.url.startsWith(item.url)) {
                        item.selected = true
                    } else {
                        item.selected = false
                    }
                })
            })

        this.readySubscription$ = this.metaverseService.ready$
            .pipe(filter(ready => ready))
            .subscribe(() => {
                const lastupdate = new Date()
                this.metaverseService.setUpdateTime(lastupdate)
                this.sync()
                this.metaverseService.updateFees()
                this.syncinterval = setInterval(() => this.update(), 5000)
            })
    }

    ngOnInit() {

        this.walletService.hasSeed()
            .then((hasSeed) => this.hasSeed = hasSeed)

        this.metaverseService.getDbUpdateNeeded()
            .then((target: any) => {
                if (target) {
                    this.router.navigate(['/loading'], { state: { data: { reset: false } } })
                }
            })
            .then(() => this.update())
    }

    ionViewWillLeave() {
        if (this.readySubscription$) {
            this.readySubscription$.unsubscribe()
        }
        clearInterval(this.syncinterval)
    }

    ngOnDestroy() {
        if (this.routerSubscription$) {
            this.routerSubscription$.unsubscribe()
        }
    }

    private update = async () => {
        return (await this.metaverseService.getUpdateNeeded()) ? this.sync()
            .then(() => this.metaverseService.setUpdateTime())
            .catch(() => console.log('Can\'t update')) : null
    }


    isOffline = () => !this.syncingSmall && this.offline
    isSyncing = () => this.syncingSmall

    sync() {
        // Only allow a single sync process
        if (this.syncing) {
            this.syncingSmall = false
            return Promise.resolve()
        } else {
            this.syncing = true
            this.syncingSmall = true
            return Promise.all([this.metaverseService.updateHeight(), this.updateBalances()])
                .then(([height, balances]) => {
                    this.height = height
                    this.syncing = false
                    this.syncingSmall = false
                    this.offline = false
                })
                .catch((error) => {
                    console.error(error)
                    this.syncing = false

                    this.syncingSmall = false
                    this.offline = true
                })
        }
    }

    private updateBalances = async () => {
        return this.metaverseService.getData()
            .then(() => {
                return this.metaverseService.setUpdateTime()
            })
            .catch((error) => console.error('Can\'t update balances: ' + error))
    }

    logout() {
        this.logoutService.logout()
    }

}
