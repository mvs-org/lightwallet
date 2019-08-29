import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';

export class Language {
    constructor(public label: string, public key: string) { }
}

@IonicPage()
@Component({
    selector: 'page-language-switcher',
    templateUrl: 'language-switcher.html',
})

export class LanguageSwitcherPage {

    languages: Language[]

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private translate: TranslateService,
        private storage: Storage,
        private event : Events,
    ) {
        this.languages = [
            new Language('English', 'en'),
            new Language("中文", 'zh'),
            new Language("한국어", 'kr'),
            new Language("日本語", 'jp'),
            new Language("Русский", 'ru'),
            new Language("Français", 'fr'),
            new Language("Deutsch", 'de'),
        ]
    }

    select(key) {
        this.translate.use(key)
        this.navCtrl.pop()
        this.storage.set('language', key)
        this.event.publish('settings_update', { type: 'language', option: key})
    }

}
