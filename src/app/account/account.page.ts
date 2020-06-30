import { Component, OnInit, OnDestroy } from '@angular/core'
import { MetaverseService } from '../services/metaverse.service'
import { Router } from '@angular/router'
import { Platform } from '@ionic/angular'
import { WalletService } from '../services/wallet.service'
import { LogoutService } from '../services/logout.service'
import { filter } from 'rxjs/operators'
import { Subscription } from 'rxjs'

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
    public apps = [
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
    public appPages = [
        {
            title: 'Portfolio',
            url: '/account/portfolio',
            icon: 'home'
        },
        {
            title: 'IDENTITIES.MENU_ENTRY',
            url: '/account/identities/ETP',
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
            title: 'SETTINGS.MENU_ENTRY',
            url: '/account/settings',
            icon: 'cog'
        },
    ]

    private readySubscription: Subscription

    constructor(
        private metaverseService: MetaverseService,
        public platform: Platform,
        private walletService: WalletService,
        private router: Router,
        private logoutService: LogoutService,
    ) {
        this.readySubscription = this.metaverseService.ready$
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
                    this.router.navigate(['/loading'])
                }
            })
            .then(() => this.update())
    }

    ionViewWillLeave() {
        console.log('leave account')
        if (this.readySubscription) {
            this.readySubscription.unsubscribe()
        }
        clearInterval(this.syncinterval)
    }

    ngOnDestroy() {
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
