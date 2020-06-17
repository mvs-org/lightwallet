import { Component, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { LanguageService } from 'src/app/services/language.service'

export class Language {
  constructor(public label: string, public key: string) { }
}

@Component({
  selector: 'app-language',
  templateUrl: './language.page.html',
  styleUrls: ['./language.page.scss'],
})

export class LanguagePage implements OnInit {

  languages: Language[]

  constructor(
    private translate: TranslateService,
    private language: LanguageService,
  ) {}

  async ngOnInit() {
    this.languages = []
    const langObj = await this.language.getLanguages()
    console.log(langObj)
    Object.keys(langObj).forEach(key => {
      console.log(key)
      this.languages.push({
        key,
        label: langObj[key].name
      })
    })
    console.log(this.languages)
  }

  select(key) {
      this.translate.use(key)
      this.language.set(key)
  }

}
