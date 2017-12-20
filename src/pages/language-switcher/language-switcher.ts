import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';

export class Language {
    constructor(public label: string, public key: string) { }
}

@Component({
    selector: 'page-language-switcher',
    templateUrl: 'language-switcher.html',
})

export class LanguageSwitcherPage {

    languages: Language[]

    constructor(public navCtrl: NavController, public navParams: NavParams, private translate: TranslateService, private storage: Storage, private event : Events) {
        this.languages = [
            new Language('English', 'en'),
            new Language("中文", 'zh'),
            new Language("한국어", 'kr'),
            new Language("Français", 'fr'),
            new Language("ไทย", 'th')
        ]
    }

    select(key) {
        this.translate.use(key)
        this.navCtrl.pop()
        this.storage.set('language', key)
        this.event.publish('language_changed', key)
    }

}
