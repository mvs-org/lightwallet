import { Injectable } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Storage } from '@ionic/storage'
import { AppService } from './app.service'

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  languages = {
    en: {
      name: 'English',
    },
    zh: {
      name: '中文',
    },
  }

  constructor(
    private translate: TranslateService,
    private storage: Storage,
    private config: AppService,
  ) {
  }

  async init() {
    this.translate.setDefaultLang(this.config.defaultLanguage)
    this.set(await this.storage.get('language') || this.config.defaultLanguage)
  }

  async set(languageKey: string) {
    if (this.languages[languageKey] !== undefined) {
      await this.translate.use(languageKey).toPromise()
      this.storage.set('language', languageKey)
      console.log(`set language to ${languageKey}`)
    } else {
      console.log(`language ${languageKey} not available`)
    }
  }

}
