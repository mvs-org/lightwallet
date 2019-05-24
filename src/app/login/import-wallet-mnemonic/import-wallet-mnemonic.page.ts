import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-import-wallet-mnemonic',
  templateUrl: './import-wallet-mnemonic.page.html',
  styleUrls: ['./import-wallet-mnemonic.page.scss'],
})
export class ImportWalletMnemonicPage implements OnInit {

  words: any = {};
  all_words: string;
  wordslist: Array<string>;
  validword: any = {};
  amount_words: number = 0;
  first_wrong: number = 0;
  validmnemonic: boolean = false;

  constructor(
    public platform: Platform,
    private walletService: WalletService,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.clear();
    this.wordslist = await this.walletService.getdictionary('EN')
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

  fromStringToArray(all_words) {
    let w = all_words.trim();
    let wordArray = w.split(" ");
    return new Promise((resolve, reject) => {
      if (all_words) {
        this.words = [];
        for (let i = 0; i < 24; i++) {
          this.words[i] = wordArray[i] ? wordArray[i] : '';
        }
        resolve(wordArray);
      } else {
        this.clear();
      }
    });
  }

  fromObjectToArray(words) {
    let all_words = '';
    let wordArray = [];
    return new Promise((resolve, reject) => {
      if (words) {
        for (let i = 0; i < 24; i++) {
          if (words[i]) {
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
      if (wordArray) {
        this.first_wrong = -1;
        this.amount_words = wordArray.length;
        for (let i = 0; i < wordArray.length; i++) {
          this.validword[i] = this.wordslist.indexOf(wordArray[i]) !== -1;
          if (this.first_wrong == -1 && !this.validword[i])
            this.first_wrong = i;
        }
        resolve([this.amount_words, this.first_wrong]);
      } else {
        this.clear();
      }
    });
  }

  validMnemonic(checkword) {
    return new Promise(async (resolve, reject) => {
      let amount_words = checkword[0];
      let first_wrong = checkword[1];
      let mnemonic = this.all_words.trim();
      if (amount_words == 24 && (first_wrong == -1 || first_wrong >= 24)) {
        this.validmnemonic = await this.walletService.checkmnemonic(mnemonic, this.wordslist);
        resolve(this.validmnemonic);
      } else {
        this.validmnemonic = false;
        resolve(this.validmnemonic);
      }
    });
  }

  import() {
    let mnemonic = '';
    Object.keys(this.words).forEach((index) => {
        this.words[index] = this.words[index].trim();
        mnemonic += String(this.words[index]).toLowerCase() + ' '
    });
    mnemonic = mnemonic.trim()
    return this.router.navigate(['login', 'select-passphrase'],
    {
      skipLocationChange: true,
      queryParams: {"mnemonic": mnemonic}
    });
  }

}
