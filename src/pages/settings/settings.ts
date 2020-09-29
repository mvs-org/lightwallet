import { Component } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobals } from '../../app/app.global';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { AlertProvider } from '../../providers/alert/alert';

@IonicPage()
@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html',
})
export class SettingsPage {

    connectcode: any
    network: string
    saved_accounts_name: any = []
    hasSeed: boolean
    walletType: string

    constructor(
        public nav: NavController,
        private mvs: MvsServiceProvider,
        public translate: TranslateService,
        private globals: AppGlobals,
        public platform: Platform,
        private alert: AlertProvider,
        private wallet: WalletServiceProvider,
        private storage: Storage,
    ) {
        this.network = this.globals.network

        this.wallet.getSavedAccounts()
            .then((accounts) => this.saved_accounts_name = (accounts && accounts.length >= 1) ? accounts.map(account => account.name) : [])

        this.wallet.hasSeed()
            .then((hasSeed) => this.hasSeed = hasSeed)

        this.storage.get('walletType').then((walletType) => {
            this.walletType = walletType === 'dna' ? 'dna' : 'etp';
        });
    }

    ionViewDidEnter() {
        this.mvs.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.nav.setRoot("LoginPage")
            })
    }

    reset() {
        if (this.walletType == 'dna') {
            this.nav.setRoot("DnaLoadingPage", { reset: true })
        } else {
            this.nav.setRoot("LoadingPage", { reset: true })
        }
    }

    BaseCurrencyPage = () => this.nav.push("BaseCurrencyPage")

    ExportWalletPage = e => this.nav.push("ExportWalletPage")

    LanguageSwitcherPage = e => this.nav.push("LanguageSwitcherPage")

    ThemeSwitcherPage = e => this.nav.push("ThemeSwitcherPage")

    InformationPage = e => this.nav.push("InformationPage")

    /**
     * Logout dialog
     */
    logout() {
        this.wallet.getSessionAccountInfo()
            .then((account_info) => {
                if(account_info || !this.hasSeed) {
                    this.alert.showLogout(this.saveAccountHandler, this.forgetAccountHandler)
                } else {
                    this.alert.showLogoutNoAccount(() => this.mvs.hardReset()
                        .then(() => this.nav.setRoot("LoginPage")))
                }
            })
    }

    newUsername(title, message, placeholder) {
        this.askUsername(title, message, placeholder)
            .then((username) => {
                if (!username) {
                    this.newUsername('SAVE_ACCOUNT_TITLE_NO_NAME', 'SAVE_ACCOUNT_MESSAGE', placeholder)
                } else if (this.saved_accounts_name.indexOf(username) != -1) {
                    this.newUsername('SAVE_ACCOUNT_TITLE_ALREADY_EXIST', 'SAVE_ACCOUNT_MESSAGE_ALREADY_EXIST', placeholder)
                } else {
                    this.saveAccount(username);
                }
            })
    }

    private forgetAccountHandler = () => {
        return this.wallet.getAccountName()
            .then((account_name) => {
                return this.wallet.deleteAccount(account_name)
                    // 删除 DNA 账户信息
                    .then(() => this.storage.get('saved_dna_accounts'))
                    .then((savedDnaAccounts) => {
                        if (savedDnaAccounts && savedDnaAccounts.length > 0) {
                            savedDnaAccounts.find((o, i) => {
                                if (o.name === account_name) {
                                    savedDnaAccounts.splice(i, 1);
                                    return true;
                                }
                            });

                            return this.storage.set('saved_dna_accounts', savedDnaAccounts);
                        }
                    });
            })
            .then(() => this.mvs.hardReset())
            .then(() => this.nav.setRoot("LoginPage"))
    }

    private saveAccountHandler = () => {
        return this.wallet.getAccountName()
            .then((current_username) => {
                if (current_username) {
                    this.saveAccount(current_username);
                } else {
                    this.newUsername('SAVE_ACCOUNT_TITLE', 'SAVE_ACCOUNT_MESSAGE', 'SAVE_ACCOUNT_PLACEHOLDER')
                }
            })
    }

    askUsername(title, message, placeholder) {
        return new Promise((resolve, reject) => {
            this.translate.get([title, message, placeholder]).subscribe((translations: any) => {
                this.alert.askInfo(translations[title], translations[message], translations[placeholder], 'text', (info) => {
                    resolve(info)
                })
            })
        })
    }

    saveAccount(username) {
        this.wallet.saveAccount(username)
            .then(() => this.storage.get('dnaUserInfo'))
            .then((dnaUserInfo) => {
                if (dnaUserInfo) {
                    return this.storage.get('saved_dna_accounts')
                        .then((savedDnaAccounts) => {
                            if (!savedDnaAccounts) {
                                savedDnaAccounts = [];
                            }
                            return this.storage.get('walletType').then((walletType) => {
                                walletType = walletType === 'dna' ? 'dna' : 'etp';

                                let index = -1;
                                savedDnaAccounts.find((o, i) => {
                                    if (o && o.name === username) {
                                        index = i;
                                        return true; // stop searching
                                    }
                                });

                                let saved = {
                                    name: username,
                                    walletType: walletType,
                                    dnaUserInfo: dnaUserInfo,
                                }

                                if (index >= 0) {
                                    savedDnaAccounts[index] = saved;
                                } else {
                                    savedDnaAccounts.push(saved);
                                }

                                return this.storage.set('saved_dna_accounts', savedDnaAccounts);
                            });
                        });
                }
            })
            .then(() => this.mvs.hardReset())
            .then(() => this.nav.setRoot("LoginPage"))
            .catch((error) => {
                this.alert.showError('MESSAGE.ERR_SAVE_ACCOUNT', error.message)
            })
    }

}
