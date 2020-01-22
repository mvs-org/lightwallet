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
            .then(() => this.isLoggedIn())
            .then(async (loggedin) => {
                if (loggedin) {
                    return this.mvs.getUpdateNeeded(this.globals.show_loading_screen_after_unused_time)
                        .then(needUpdate => this.rootPage = needUpdate ? "LoadingPage" : "AccountPage")
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

    isLoggedIn(): any {
        return this.storage.get('mvs_addresses')
            .then((addresses) => (addresses != undefined && addresses != null && Array.isArray(addresses) && addresses.length))

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
        return this.isLoggedIn()
            .then((loggedin) => {
                if (loggedin)
                    return this.setPrivateMenu()
                else
                    return this.setPublicMenu()
            })
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
        return Promise.all([
            { title: 'LOGIN', component: "LoginPage", icon: 'log-in', root: true },
            { title: 'NEWS', component: "NewsPage", icon: 'paper' },
            { title: 'REPORT_BUG', newtab: 'https://github.com/mvs-org/lightwallet/issues', icon: 'bug' },
            { title: 'INFORMATION.TITLE', component: "InformationPage", icon: 'information-circle' }
        ].map((entry) => this.addToMenu(entry)))
    }

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
                    { title: 'ACCOUNT.TITLE', component: "AccountPage", icon: 'home', root: true },
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
