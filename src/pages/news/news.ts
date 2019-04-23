import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage()
@Component({
    selector: 'page-news',
    templateUrl: 'news.html',
})
export class NewsPage {

    listNews: any[]

    constructor(
        public navCtrl: NavController, 
        public navParams: NavParams, 
		private mvs: MvsServiceProvider,
		private wallet: WalletServiceProvider,
    ) {
    
    }

    ionViewDidLoad() {
    	this.wallet.getLanguage().then((lang) => this.updatenews(lang == "zh" ? "zh-cn" : "en-us"))
    }
	
	updatenews(lang = "en-us") {
		Promise.all([this.wallet.getNewNews(lang, 25).toPromise(), this.wallet.getNews(lang)])
                .then(([newNews, storedNews]) => {
					this.listNews = newNews.json().results ? newNews.json().results : storedNews

					if(this.listNews)
						this.wallet.setNews(this.listNews, lang)
				})

	}

}
