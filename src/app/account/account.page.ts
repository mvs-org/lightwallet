import { Component, OnInit, OnDestroy } from '@angular/core'
import { MetaverseService } from '../services/metaverse.service'
import { Router } from '@angular/router'
import { Platform } from '@ionic/angular'
import { WalletService } from '../services/wallet.service'
import { AlertService } from '../services/alert.service'
import { TranslateService } from '@ngx-translate/core'
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

    saved_accounts_name: any = []
    height: number
    offline = false
    hasSeed: boolean
    public selectedIndex = 0
    public appPages = [
        {
            title: 'Portfolio',
            url: '/account/portfolio',
            icon: 'home'
        },
        {
            title: 'AVATAR.MENU_ENTRY',
            url: '/account/avatar',
            icon: 'person'
        },
        {
            title: 'Addresses',
            url: '/account/addresses/ETP',
            icon: 'swap-horizontal'
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
            title: 'EXPORT_MASTER_PUBLIC_KEY.MENU_ENTRY',
            url: '/account/export-xpub',
            icon: 'pricetag'
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
        private alertService: AlertService,
        private translate: TranslateService,
        private router: Router,
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

        this.walletService.getSavedAccounts()
            .then((accounts) => this.saved_accounts_name = (accounts && accounts.length >= 1) ? accounts.map(account => account.name) : [])

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
        this.walletService.getSessionAccountInfo()
            .then((accountInfo) => {
                if (accountInfo || !this.hasSeed) {
                    this.alertService.showLogout(this.saveAccountHandler, this.forgetAccountHandler)
                } else {
                    this.alertService.showLogoutNoAccount(() => this.metaverseService.hardReset()
                        .then(() => this.router.navigate(['/'])))
                }
            })
    }

    newUsername(title, message, placeholder) {
        this.askUsername(title, message, placeholder)
            .then((username) => {
                if (!username) {
                    this.newUsername('SAVE_ACCOUNT_TITLE_NO_NAME', 'SAVE_ACCOUNT_MESSAGE', placeholder)
                } else if (this.saved_accounts_name.indexOf(username) !== -1) {
                    this.newUsername('SAVE_ACCOUNT_TITLE_ALREADY_EXIST', 'SAVE_ACCOUNT_MESSAGE_ALREADY_EXIST', placeholder)
                } else {
                    this.saveAccount(username)
                }
            })
    }

    private forgetAccountHandler = () => {
        return this.walletService.getAccountName()
            .then((accountName) => this.walletService.deleteAccount(accountName))
            .then(() => this.metaverseService.hardReset())
            .then(() => this.router.navigate(['/']))
    }

    private saveAccountHandler = () => {
        return this.walletService.getAccountName()
            .then((currentUsername) => {
                if (currentUsername) {
                    this.saveAccount(currentUsername)
                } else {
                    this.newUsername('SAVE_ACCOUNT_TITLE', 'SAVE_ACCOUNT_MESSAGE', 'SAVE_ACCOUNT_PLACEHOLDER')
                }
            })
    }

    askUsername(title, message, placeholder) {
        return new Promise((resolve, reject) => {
            this.translate.get([title, message, placeholder]).subscribe((translations: any) => {
                this.alertService.askInfo(translations[title], translations[message], translations[placeholder], 'text', (info) => {
                    resolve(info)
                })
            })
        })
    }

    saveAccount(username) {
        this.walletService.saveAccount(username)
            .then(() => this.metaverseService.hardReset())
            .then(() => this.router.navigate(['/']))
            .catch((error) => {
                this.alertService.showError('MESSAGE.ERR_SAVE_ACCOUNT', error.message)
            })
    }

    updateTheme() {
        document.body.classList.toggle('dark')
    }
}
