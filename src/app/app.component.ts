import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';

import { Storage } from '@ionic/storage';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any
    pages: Array<{ title: string, component: any }> = [];

    constructor(private splashScreen: SplashScreen, public platform: Platform, private storage: Storage, public translate: TranslateService, private event: Events) {

        this.initializeApp()
            .then(() => this.storage.get('language'))
            .then((language) => this.initLanguage(language))
            .then(() => this.isLoggedIn())
            .then((loggedin) => {
                if (loggedin) {
                    this.rootPage = "AccountPage"
                } else {
                    this.rootPage = "LoginPage"
                }
                return;
            })
            .then(()=>this.splashScreen.hide())
            .catch((e) => console.error(e));

        this.setTheme();
        this.event.subscribe("theme_changed", (theme) => {
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

    isLoggedIn = () => {
        return this.storage.get('mvs_addresses')
            .then((addresses) => (addresses != undefined && addresses != null && Array.isArray(addresses) && addresses.length))

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
            })
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
            { title: 'LANGUAGE_SETTINGS', component: "LanguageSwitcherPage", icon: 'flag' },
            { title: 'THEME_SETTINGS', component: "ThemeSwitcherPage", icon: 'color-palette' },
            { title: 'REPORT_BUG', newtab: 'https://github.com/mvs-org/lightwallet/issues', icon: 'bug' },
            { title: 'INFORMATION', component: "InformationPage", icon: 'information-circle' }
        ].map((entry) => this.addToMenu(entry)))
    }

    setPrivateMenu() {
        return Promise.all([
            { title: 'ACCOUNT.TITLE', component: "AccountPage", icon: 'home', root: true },
            { title: 'ETP_DEPOSIT', component: "DepositPage", icon: 'log-in' },
            { title: 'ASSET_ISSUE', component: "AssetIssuePage", icon: 'globe' },
            { title: 'LANGUAGE_SETTINGS', component: "LanguageSwitcherPage", icon: 'flag' },
            { title: 'THEME_SETTINGS', component: "ThemeSwitcherPage", icon: 'color-palette' },
            { title: 'SETTINGS', component: "SettingsPage", icon: 'settings' },
            { title: 'REPORT_BUG', newtab: 'https://github.com/mvs-org/lightwallet/issues', icon: 'bug' },
            { title: 'INFORMATION', component: "InformationPage", icon: 'information-circle' }
        ].map((entry) => this.addToMenu(entry)))
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
                this.nav.push(page.component);
        }
        else if (page.newtab)
            window.open(page.newtab, '_blank');
    }
}
