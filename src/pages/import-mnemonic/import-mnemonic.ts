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
    wordslist: Array<string>;
    validword: any = {};
    amount_words: number = 0;
    first_wrong: number = 0;
    validmnemonic: boolean = false;

    constructor(public nav: NavController,
        public mvs: MvsServiceProvider,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        private translate: TranslateService,
        public platform: Platform,
        private global: AppGlobals) {
        for (var i = 0; i < 24; i++) {
            this.words[i] = '';
            this.validword[i] = false;
        }
        this.wordslist = mvs.getdictionary('EN');
    }

    clear() {
        for (var i = 0; i < 24; i++) {
            this.words[i] = '';
            this.validword[i] = false;
        }
       	this.all_words = '';
        this.amount_words = 0;
        this.first_wrong = 0;
        this.validmnemonic = false;
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

    onChange() {
        this.fromStringToArray(this.all_words)
            .then((words) => this.checkWords(words))
            .then((checkword) => this.validMnemonic(checkword))
            .catch((error) => { console.log('onChange did not pass', error) });
    }

    onChangePerWord() {
        this.fromObjectToArray(this.words)
            .then((words) => this.checkWords(words))
            .then((checkword) => this.validMnemonic(checkword))
            .catch((error) => { console.log('onChangePerWord did not pass', error) });
    }


    // set it in the browser
    fromStringToArray(all_words) {
        // testing
        let w = all_words.trim();
        let wordArray = w.split(" ");
        return new Promise((resolve, reject) => {
            if(all_words) {
                this.words = [];
                for(let i=0;i<24;i++){
                    this.words[i] = wordArray[i] ? wordArray[i] : '';
                }
                resolve(wordArray);
            } else {
                this.clear();
            }
        });
    }

    fromObjectToArray(words) {
        // testing
        let all_words = '';
        let wordArray = [];
        return new Promise((resolve, reject) => {
            if(words) {
                for(let i=0;i<24;i++){
                    if(words[i]) {
                        all_words += (words[i] + ' ');
                        wordArray.push(words[i])
                    }
                }
                this.all_words = all_words.trim();
                resolve(wordArray);
            } else {
                this.clear();
            }
        });
    }

    checkWords(wordArray) {
        return new Promise((resolve, reject) => {
            if(wordArray) {
                this.first_wrong = -1;
                this.amount_words = wordArray.length;
                for(let i=0;i<wordArray.length;i++){
                    this.validword[i] = this.wordslist.indexOf(wordArray[i]) !== -1;
                    if(this.first_wrong == -1 && !this.validword[i])
                        this.first_wrong = i;
                }
                resolve([this.amount_words, this.first_wrong]);
            } else {
                this.clear();
            }
        });
    }

    validMnemonic(checkword) {
        return new Promise((resolve, reject) => {
            let amount_words = checkword[0];
            let first_wrong = checkword[1];
            let mnemonic = this.all_words.trim();
            if(amount_words == 24 && (first_wrong == -1 || first_wrong >= 24)) {
                this.validmnemonic = this.mvs.checkmnemonic(mnemonic, this.wordslist);
                resolve(this.validmnemonic);
            } else {
                this.validmnemonic = false;
                resolve(this.validmnemonic);
            }
        });
    }

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
