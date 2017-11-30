import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { DepositPage } from '../pages/deposit/deposit';
import { LanguageSwitcherPage } from '../pages/language-switcher/language-switcher';
import { ThemeSwitcherPage } from '../pages/theme-switcher/theme-switcher';
import { InformationPage } from '../pages/information/information';
import { SettingsPage } from '../pages/settings/settings';

import { Storage } from '@ionic/storage';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any
    pages: Array<{ title: string, component: any }> = [];

    constructor(public platform: Platform, private storage: Storage, public translate: TranslateService, private event: Events) {
        this.setTheme();
        setTimeout(()=>this.initLanguage('en'), 1000);
        this.event.subscribe("theme_changed", (theme) => {
                this.storage.set('theme',theme)
                .then(()=>this.setTheme())
        });
        this.event.subscribe("language_changed", () => {
            this.setMenu()
                .then((menu: any) => {
                    this.pages = menu
                })
        });
        this.initializeApp()
            .then(() => this.storage.get('language'))
            .then((language) => this.initLanguage(language))
            .then(()=>this.storage.get('mvs_addresses'))
            .then(_ => {
                this.rootPage = (_ != null) ? AccountPage : LoginPage;
                return this.setMenu()
            })
            .then((menu: any) => { this.pages = menu })
            .catch((e) => console.error(e));
    }

    setTheme(){
        this.storage.get('theme')
            .then((theme)=>{
                document.getElementById('theme').className='theme-'+((theme)?theme:'default');
            })
    }

    initLanguage(language:string) {
        this.translate.setDefaultLang('en');
        this.translate.use((language) ? language : 'en');
        this.event.publish('language_changed', (language) ? language : 'en');
        this.storage.set('language', (language) ? language : 'en');
        return
    }


    setMenu() {
        return Promise.all([
            { title: 'ETP_DEPOSIT', component: DepositPage, icon: 'log-in' },
            { title: 'LANGUAGE_SETTINGS', component: LanguageSwitcherPage, icon: 'flag' },
            { title: 'THEME_SETTINGS', component: ThemeSwitcherPage, icon: 'color-palette' },
            { title: 'SETTINGS', component: SettingsPage, icon: 'settings' },
            { title: 'INFORMATION', component: InformationPage, icon: 'information-circle' }
        ].map((entry) => this.addToMenu(entry)))
    }

    private addToMenu(menu_entry) {
        return new Promise((resolve, reject) => {
            this.translate.get(menu_entry.title).subscribe((lang) => {
                menu_entry.caption=lang;
                resolve(menu_entry)
            })
        })
    }

    initializeApp() {
        this.initLanguage('en');
        return this.platform.ready();
    }

    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.push(page.component);
    }
}
