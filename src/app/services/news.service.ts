import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { map } from 'rxjs/operators';


export interface News {
  content: string;
  date: string;
  link: {
    link_type: string;
    url: string;
  };
  slug: string;
  title: string;
}

export interface NewsResponse {
  page: number;
  results: News[];
  total_pages: number;
}

export interface NewsStore {
  [language: string]: News[]
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  news = new Subject<News[]>();
  loading = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private storage: Storage,
  ) {
  }

  getNewsLang(lang: string) {
    switch (lang) {
      case 'zh':
        return 'zh-cn';
      default:
        return 'en-us';
    }
  }

  loadNews(lang: string) {
    const limit = 25;
    return this.http.get(`https://explorer.mvs.org/api/content/news?lang=${this.getNewsLang(lang)}&${limit}`)
      .pipe(
        map((response: any) => response.results),
      );
  }

  async getStored(lang: string) {
    const news: NewsStore = await this.storage.get('news');
    if (news && news[lang]) {
      return news[lang];
    }
    return [];
  }

  async storeNews(news: News[], lang: string) {
    const allLangNews = await this.storage.get('news') || {};
    allLangNews[lang] = news;
    return this.storage.set('news', allLangNews);
  }
}
