import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage()
@Component({
    selector: 'page-news',
    templateUrl: 'news.html',
})
export class NewsPage {

    listNews: any[]
    updatingNews: boolean = true

    constructor(
        public navCtrl: NavController, 
        public navParams: NavParams, 
		private wallet: WalletServiceProvider,
    ) {
    
    }

    ionViewDidLoad() {
        let newsLang
        this.wallet.getLanguage()
            .then((lang) => {
                newsLang = lang == "zh" ? "zh-cn" : "en-us"
                return this.wallet.getNews(newsLang)
            })
            .then((localNews) => this.listNews = localNews)
            .then(() => this.updatenews(newsLang))
    }
	
	updatenews(lang = "en-us") {
		this.wallet.getNewNews(lang, 25).toPromise()
            .then((newNews) => {
                this.updatingNews = false;
                this.listNews = newNews.json().results ? newNews.json().results : this.listNews
                if(this.listNews)
                    this.wallet.setNews(this.listNews, lang)
            })

	}

}
