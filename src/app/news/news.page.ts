import { Component, OnInit } from '@angular/core';
import { NewsService, News } from '../services/news.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject, from, Observable, combineLatest, forkJoin } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { catchError, merge, map, concat } from 'rxjs/operators';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {


  loading: boolean;
  newsList: News[];

  constructor(
    public newsService: NewsService,
    private toastCtrl: ToastController,
    private translate: TranslateService,
  ) {
  }

  async getNews() {

    const language = this.translate.currentLang || this.translate.defaultLang;
    this.loading = true;
    this.newsList = await this.newsService.getStored(language);
    this.newsService.loadNews(language)
      .subscribe(news => {
        this.newsService.storeNews(news, language);
        this.newsList = news;
        this.loading = false;
      }, this.handleLoadError);
  }

  handleLoadError = async (error) => {
    const alert = await this.toastCtrl.create({
      color: 'danger',
      message: await this.translate.get('NEWS.MESSAGE.LOADING_FAILED').toPromise()
    });
    alert.present();
    return [];
  }

  ngOnInit() {
    this.translate.setDefaultLang('en');
    this.getNews();
  }

}
