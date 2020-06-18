import { Component, OnInit } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { Platform } from '@ionic/angular'
import { AlertService } from 'src/app/services/alert.service'
import { TranslateService } from '@ngx-translate/core'
import { AppService } from 'src/app/services/app.service'
import { Router } from '@angular/router'
import { WalletService } from 'src/app/services/wallet.service'

@Component({
    selector: 'app-settings',
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

    connectcode: any
    network: string
    saved_accounts_name: any = []
    hasSeed: boolean

    constructor(
        private metaverseService: MetaverseService,
        public platform: Platform,
        private alertService: AlertService,
        private translate: TranslateService,
        private appService: AppService,
        private router: Router,
        private walletService: WalletService,
    ) {

    }

    async ngOnInit() {
        this.network = await this.appService.getNetwork()
        console.log('Settings page loaded')
        const addresses = await this.metaverseService.getAddresses()
        if (!Array.isArray(addresses) || !addresses.length) {
            this.router.navigate(['/loading'])
        }

        const accounts = await this.walletService.getSavedAccounts()
        this.saved_accounts_name = (accounts && accounts.length >= 1) ? accounts.map(account => account.name) : []

        this.hasSeed = await this.walletService.hasSeed()

    }

    async reset() {
        await this.metaverseService.dataReset()
        this.router.navigate(['/loading'])
    }

    // BaseCurrencyPage = () => this.nav.push("BaseCurrencyPage")

    // ExportWalletPage = e => this.nav.push("ExportWalletPage")

    // LanguageSwitcherPage = e => this.nav.push("LanguageSwitcherPage")
    // routerLink="/settings/language"

    // InformationPage = e => this.nav.push("InformationPage")

    /**
     * Logout dialog
     */
    async logout() {
        const accountInfo = await this.walletService.getSessionAccountInfo()
        if (accountInfo || !this.hasSeed) {
            this.alertService.showLogout(this.saveAccountHandler, this.forgetAccountHandler)
        } else {
            this.alertService.showLogoutNoAccount(() => this.metaverseService.hardReset()
                .then(() => this.router.navigate(['/loading'])))
        }
    }

    async newUsername(title, message, placeholder) {
        const username = await this.askUsername(title, message, placeholder)
        if (!username) {
            this.newUsername('SAVE_ACCOUNT_TITLE_NO_NAME', 'SAVE_ACCOUNT_MESSAGE', placeholder)
        } else if (this.saved_accounts_name.indexOf(username) !== -1) {
            this.newUsername('SAVE_ACCOUNT_TITLE_ALREADY_EXIST', 'SAVE_ACCOUNT_MESSAGE_ALREADY_EXIST', placeholder)
        } else {
            this.saveAccount(username)
        }
    }

    async forgetAccountHandler() {
        const accountName = await this.walletService.getAccountName()
        await this.walletService.deleteAccount(accountName)
        await this.metaverseService.hardReset()
        this.router.navigate(['/loading'])
    }

    async saveAccountHandler() {
        const currentUsername = await this.walletService.getAccountName()
        if (currentUsername) {
            this.saveAccount(currentUsername)
        } else {
            this.newUsername('SAVE_ACCOUNT_TITLE', 'SAVE_ACCOUNT_MESSAGE', 'SAVE_ACCOUNT_PLACEHOLDER')
        }
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
            .then(() => this.router.navigate(['/loading']))
            .catch((error) => {
                this.alertService.showError('MESSAGE.ERR_SAVE_ACCOUNT', error.message)
            })
    }

    updateTheme() {
        document.body.classList.toggle('dark')
    }

}
