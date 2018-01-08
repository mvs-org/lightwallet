import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, LoadingController, Loading, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AppGlobals } from '../../app/app.global';

@IonicPage()
@Component({
    selector: 'page-import-mnemonic',
    templateUrl: 'import-mnemonic.html',
})
export class ImportMnemonicPage {
    loading: Loading;
    words: any = {};
    index: number = this.global.index;
    wallet: any;
    all_words: string;
    passed: boolean;

    constructor(public nav: NavController,
        public mvs: MvsServiceProvider,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        private translate: TranslateService,
        public platform: Platform,
        private global: AppGlobals) {
        for (var i = 0; i < 24; i++)
            this.words[i] = '';
        this.passed = false;
    }

    clear() {
        for (var i = 0; i < 24; i++)
            this.words[i] = '';
       	this.all_words = '';
    }

    import() {
        this.showLoading()
        let mnemonic = '';
        Object.keys(this.words).forEach((index) => {
            this.words[index] = this.words[index].trim();
            mnemonic += String(this.words[index]).toLowerCase() + ' '
        });
        mnemonic = mnemonic.trim()
        this.nav.push("PassphrasePage", { mnemonic: mnemonic })
    }

    // testing
    onChange() {
        this.displayWords(this.all_words)
        	  .then((all_words)=>this.countWords(all_words))
            .then((count) => this.compareWords(count))
            .catch((error) => { console.log('onChange did not pass', error) });
    }


    // set it in the browser
    displayWords(words) {
        // testing
        let wordArray = words.split(" ");
        return new Promise((resolve, reject) => {
            if(words) {
                for(let i=0;i<wordArray.length;i++){this.words[i]=wordArray[i]}
                resolve(words);
            } else {
                this.clear();
            }
        });
    }

    // returns the number of words
    // TODO: replace with regex
    countWords(words) {
        let w = words.trim();
        return new Promise((resolve, reject) => {
            if (words) {
                resolve(w.split(' ').length);
            } else {
                resolve(0)
            }
        });
    };

    // resolves if words count to 24
    // TODO: Error handle show error to user
    compareWords(amount_words) {
        return new Promise((resolve, reject) => {
            if (amount_words == 24) {
                this.passed = true;
                resolve(this.passed);
            } else {
                this.passed = false;
                reject(Error("compareWords: "+ amount_words));
            }
        });
    };

    showLoading() {
        this.translate.get('MESSAGE.LOADING').subscribe((loading: string) => {
            this.loading = this.loadingCtrl.create({
                content: loading,
                dismissOnPageChange: true
            });
            this.loading.present();
        })
    }

    showError(text) {
        this.loading.dismiss();
        this.translate.get('MESSAGE.ERROR_TITLE').subscribe((title: string) => {
            let alert = this.alertCtrl.create({
                title: title,
                subTitle: text,
                buttons: ['OK']
            });
            alert.present(prompt);
        })
    }

}
