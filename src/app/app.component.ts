import { Component, ViewChild } from '@angular/core'
import { Nav, Platform, Events } from 'ionic-angular'
import { SplashScreen } from '@ionic-native/splash-screen'
import { TranslateService } from '@ngx-translate/core'
import { StatusBar } from '@ionic-native/status-bar'
import { Keyboard } from '@ionic-native/keyboard'
import { AppGlobals } from './app.global'
import { Storage } from '@ionic/storage'
import { PluginProvider } from '../providers/plugin/plugin'
import { MvsServiceProvider } from '../providers/mvs-service/mvs-service';
import { Deeplinks } from '@ionic-native/deeplinks';

@Component({
    templateUrl: 'app.html'
})
export class MyETPWallet {
    @ViewChild(Nav) nav: Nav;

    rootPage: any
    pages: Array<{ title: string, component: any }> = [];

    // 钱包类型：etp or dna
    public walletType: string;
    // 是否具有 etp
    public walletHasEtp: boolean = false;
    // 是否具有 dna
    public walletHasDna: boolean = false;
    // 是否已登录
    public isLogged:boolean;

    constructor(
        private splashScreen: SplashScreen,
        public platform: Platform,
        private storage: Storage,
        private plugins: PluginProvider,
        public translate: TranslateService,
        private event: Events,
        private mvs: MvsServiceProvider,
        private globals: AppGlobals,
        public statusBar: StatusBar,
        public keyboard: Keyboard,
        private deeplinks: Deeplinks,
    ) {

        const networkQueryParam = this.getQueryParameter('network')

        this.getNetwork(networkQueryParam)
            .then((network) => this.initNetwork(network))
            .then(() => this.initializeApp())
            .then(() => this.storage.get('language'))
            .then((language) => this.initLanguage(language))
            .then(() => this.initDobuleWallet())  // 初始化双链
            .then(() => this.isLoggedIn())
            .then(async (loggedin) => {
                if (loggedin) {
                    if (this.isDna() && this.walletHasDna) {
                        this.rootPage = 'DnaLoadingPage';
                    } else {
                        return this.mvs.getUpdateNeeded(this.globals.show_loading_screen_after_unused_time)
                            .then(needUpdate => this.rootPage = needUpdate ? "LoadingPage" : "AccountPage")
                    }
                } else {
                    this.rootPage = "LoginPage"
                }
            })
            .then(() => this.keyboard.hideKeyboardAccessoryBar(false))
            .then(() => this.splashScreen.hide())
            .then(() => {
                if (this.rootPage !== 'LoadingPage') {
                    return this.deeplinks.routeWithNavController(this.nav, {
                        '/send/:asset': 'transfer-page',
                        '/#/send/:asset': 'transfer-page',
                    }).subscribe((match) => {
                        console.log('Successfully matched route', match);
                    },
                        (nomatch) => {
                            // nomatch.$link - the full link data
                            console.error('Got a deeplink that didn\'t match', nomatch);
                        })
                }
            })
            .catch((e) => console.error(e));

        this.setTheme();
        this.event.subscribe("theme_changed", (theme) => {
            this.setHeaderColor(theme);
            this.storage.set('theme', theme)
                .then(() => this.setTheme())
        });

        this.event.subscribe("settings_update", () => {
            this.setMenu()
                .then((menu: any) => {
                    this.pages = menu
                    return;
                })
        });
    }

    initDobuleWallet() {
        return this.isLoggedIn()
            .then((logged) => this.isLogged = !!logged)
            .then(() => this.storage.get('walletType'))
            .then((type) => {
                this.walletType = (type === 'dna' ? 'dna' : 'etp')
            })
            .then(() => this.storage.get('walletHasEtp'))
            .then((hasEtp) => {
                this.walletHasEtp = !!hasEtp;
                //if (this.walletType == 'etp' && !this.walletHasEtp) {
                //    this.walletType = 'dna';
                //}
            })
            .then(() => this.storage.get('walletHasDna'))
            .then((hasDna) => {
                this.walletHasDna = !!hasDna;
                //if (this.walletType == 'dna' && !this.walletHasDna) {
                //    this.walletType = 'etp';
                //}
            })
            .then(() => {
                console.log('app.isLogged:', this.isLogged)
                console.log('app.walletType:', this.walletType)
                console.log('app.walletHasEtp:', this.walletHasEtp)
                console.log('app.walletHasDna:', this.walletHasDna)
            });
    }

    isLoggedIn(): any {
        return this.storage.get('mvs_addresses')
            .then((addresses) => (addresses != undefined && addresses != null && Array.isArray(addresses) && addresses.length))
    }

    hasSeed() {
        return this.storage.get('seed')
            .then((seed) => seed !== null)
    }

    // 是否为ETP钱包
    isEtp() {
        return this.walletType !== 'dna';
    }

    // 是否为DNA钱包
    isDna() {
        return this.walletType === 'dna';
    }

    setWalletType(type) {
        this.walletType = (type === 'dna' ? 'dna' : 'etp');
        this.storage.set('walletType', this.walletType)
            .then(() => {
                if (this.isDna()) {
                    this.nav.setRoot("DnaLoadingPage", { reset: true })
                } else {
                    this.nav.setRoot("LoadingPage", { reset: true })
                }
            })
            .then(() => {
                setTimeout(() => {
                    this.setMenu()
                        .then((menu: any) => {
                            this.pages = menu;
                            return;
                        });
                }, 2 * 1000);
            });
    }

    async getNetwork(networkQueryParam) {
        const loginStatus = await this.isLoggedIn()
        if (loginStatus) return this.storage.get('network')
        switch (networkQueryParam) {
            case 'testnet':
            case 'mainnet':
                console.info('set network to ' + networkQueryParam)
                await this.storage.set('network', networkQueryParam)
                return networkQueryParam
        }
        return this.storage.get('network')
    }

    setMenu = () => {
        return this.initDobuleWallet()
            .then(() => {
                return Promise.all([this.isLoggedIn(), this.hasSeed(), this.isEtp()])
                    .then(([loggedin, hasseed, isEtp]) => {
                        if (loggedin && hasseed)
                            if (isEtp) {
                                return this.setPrivateMenu()
                            } else {
                                return this.setPrivateMenuDna();
                            }
                        else if (loggedin && !hasseed)
                            if (isEtp) {
                                return this.setReadOnlyMenu()
                            } else {
                                return this.setPrivateMenuDna();
                            }
                        else
                            return this.setPublicMenu()
                    });
            });
    }

    setTheme() {
        this.storage.get('theme')
            .then((theme) => {
                document.getElementById('theme').className = 'theme-' + ((theme) ? theme : 'default');
                this.setHeaderColor(theme);
            })
    }

    initNetwork(network) {
        this.globals.network = (network) ? network : 'mainnet'
    }

    initLanguage(language: string) {
        this.translate.setDefaultLang('en');
        this.translate.use((language) ? language : 'en');
        this.event.publish('settings_update', (language) ? language : 'en');
        this.storage.set('language', (language) ? language : 'en');
        return
    }


    setPublicMenu() {
        this.isLogged = false;

        return Promise.all([
            { title: 'LOGIN', component: "LoginPage", icon: 'log-in', root: true },
            { title: 'NEWS', component: "NewsPage", icon: 'paper' },
            { title: 'REPORT_BUG', newtab: 'https://github.com/mvs-org/lightwallet/issues', icon: 'bug' },
            { title: 'INFORMATION.TITLE', component: "InformationPage", icon: 'information-circle' }
        ].map((entry) => this.addToMenu(entry)))
    }

    setReadOnlyMenu() {
        return Promise.all([
            { title: 'ACCOUNT.TITLE', component: this.isEtp() ? "AccountPage" : "DnaAccountPage", icon: 'home', root: true },
            { title: 'AVATARS', component: "AvatarsPage", icon: 'person' },
            { title: 'REGISTER_MST', component: "AssetIssuePage", icon: 'globe' },
            { title: 'REGISTER_MIT', component: "MITRegisterPage", icon: 'create' },
            { title: 'NEWS', component: "NewsPage", icon: 'paper' },
            { title: 'ADVANCED', component: "AdvancedPage", icon: 'settings' },
            { title: 'SETTINGS', component: "SettingsPage", icon: 'options' },
            { title: 'REPORT_BUG', component: "ReportPage", icon: 'bug' }
        ].map((entry) => this.addToMenu(entry)))
    }

    // 设置 ETP 钱包菜单
    setPrivateMenu() {
        return this.plugins.getPlugins()
            .then(plugins => {
                let p = []
                plugins.forEach(plugin => {
                    p.push({
                        title: (plugin.translation[this.translate.currentLang]) ? plugin.translation[this.translate.currentLang].name : plugin.translation.default.name, component: "PluginStartPage", params: { name: plugin.name }, icon: 'cube', beta: true
                    })
                })
                return p
            })
            .then(plugins => {
                return Promise.all([
                    { title: 'ACCOUNT.TITLE', component: this.isEtp() ? "AccountPage" : "DnaAccountPage", icon: 'home', root: true },
                    { title: 'AVATARS', component: "AvatarsPage", icon: 'person' },
                    { title: 'AUTHENTICATION.TITLE', component: "AuthPage", icon: 'bitident', beta: true },
                    { title: 'REGISTER_MST', component: "AssetIssuePage", icon: 'globe' },
                    { title: 'REGISTER_MIT', component: "MITRegisterPage", icon: 'create' },
                    { title: 'APPS', component: "AppsPage", icon: 'appstore', beta: true },
                    { title: 'NEWS', component: "NewsPage", icon: 'paper' },
                    { title: 'ADVANCED', component: "AdvancedPage", icon: 'settings' },
                    { title: 'SETTINGS', component: "SettingsPage", icon: 'options' },
                    { title: 'REPORT_BUG', component: "ReportPage", icon: 'bug' }
                ].concat(plugins).map((entry) => this.addToMenu(entry)))
            });
    }

    // 设置 DNA 钱包菜单
    setPrivateMenuDna() {
        return this.plugins.getPlugins()
            .then(plugins => {
                let p = []
                plugins.forEach(plugin => {
                    p.push({
                        title: (plugin.translation[this.translate.currentLang]) ? plugin.translation[this.translate.currentLang].name : plugin.translation.default.name, component: "PluginStartPage", params: { name: plugin.name }, icon: 'cube', beta: true
                    })
                })
                return p
            })
            .then(plugins => {
                return Promise.all([
                    { title: 'ACCOUNT.TITLE', component: this.isEtp() ? "AccountPage" : "DnaAccountPage", icon: 'home', root: true },
                    { title: 'DNA.LOCK', component: "dna-lock-page", icon: 'lock' },
                    { title: 'VOTE', component: "dna-vote-page", icon: 'ribbon' },
                    { title: 'APPS', component: "AppsPage", icon: 'appstore', beta: true },
                    { title: 'NEWS', component: "NewsPage", icon: 'paper' },
                    { title: 'ADVANCED', component: "AdvancedPage", icon: 'settings' },
                    { title: 'SETTINGS', component: "SettingsPage", icon: 'options' },
                    { title: 'REPORT_BUG', component: "ReportPage", icon: 'bug' }
                ].concat(plugins).map((entry) => this.addToMenu(entry)))
            });
    }

    setHeaderColor(key) {
        // Status bar theme for android
        if (this.platform.is('android')) {
            this.statusBar.styleLightContent();
            this.statusBar.backgroundColorByHexString('#000000');
        } else if (this.platform.is('ios')) {    // Status bar theme for iOS
            if ((key == 'noctilux') || (key == 'solarized')) {
                this.statusBar.styleLightContent();
            } else {
                this.statusBar.styleDefault();
            }
        }
    }

    private addToMenu(menu_entry) {
        return new Promise((resolve, reject) => {
            this.translate.get(menu_entry.title).subscribe((lang) => {
                menu_entry.caption = lang;
                resolve(menu_entry)
            })
        })
    }

    initializeApp() {
        return this.platform.ready()
    }

    openPage(page) {
        if (page.component) {
            if (page.root)
                this.nav.setRoot(page.component);
            else
                this.nav.push(page.component, page.params);
        }
        else if (page.newtab)
            if (this.platform.is('mobile') && this.platform.is('ios'))
                window.open(page.newtab, '_self');
            else
                window.open(page.newtab, '_blank');


    }

    getQueryParameter(name) {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(window.location.href);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
}
