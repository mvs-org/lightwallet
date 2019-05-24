import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-language',
  templateUrl: './language.page.html',
  styleUrls: ['./language.page.scss'],
})
export class LanguagePage implements OnInit {

  languages = this.language.languages;

  constructor(
    private language: LanguageService,
  ) { }

  set(languageKey: string) {
    return this.language.set(languageKey);
  }

  ngOnInit() {
  }

}
