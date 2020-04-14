import { Component, OnInit } from '@angular/core';
//import { AppGlobals } from '../app.global';
//import { Storage } from '@ionic/storage';
//import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { TranslateService } from '@ngx-translate/core';
//import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
//import { AlertProvider } from '../../providers/alert/alert';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public network = 'mainnet';
  saved_accounts: Array<any> = [];
  isApp: boolean;
  globals = {network: 'mainnet'};

  languages = [
    {
      name: 'English',
      key: 'en',
    }, {
      name: '中文',
      key: 'zh',
    }, {
      name: 'Français',
      key: 'fr',
    }, {
      name: 'Deutsch',
      key: 'de',
    },
  ];

  constructor(
    //private nav: NavController,
    //public platform: Platform,
    //private storage: Storage,
    //public globals: AppGlobals,
    //private event: Events,
    //private wallet: WalletServiceProvider,
    //private navParams: NavParams,
    private translate: TranslateService,
    //public mvs: MvsServiceProvider,
    //private alert: AlertProvider,
  ) {
    this.isApp = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'));

    //this.wallet.getSavedAccounts()
    //    .then((accounts) => this.saved_accounts = accounts ? accounts : [])

    translate.addLangs(this.languages.map((lang) => lang.key));
    translate.setDefaultLang('en');
    const preferredLanguage = localStorage.getItem('lang') || this.translate.getBrowserLang();
    translate.use(preferredLanguage);
  }

  ngOnInit() {
  }

  getLogoClasses() {
    return {
      banner: true,
      china: this.translate.currentLang === 'zh'
    };
  }

  //GenerateKeyPage = e => this.nav.push("GenerateKeyPage")

  //version = () => 'v' + this.globals.version + ' ' + this.globals.name;

  version = () => 'v' + '0.9.0' + ' ' + 'revelation';

  //ImportMnemonicPage = e => this.nav.push("ImportMnemonicPage")

  //switchLanguage = e => this.nav.push("LanguageSwitcherPage")

  //switchNetwork = network => this.storage.set("network", this.network)
  //    .then(() => this.loadNetwork())

  /*loadNetwork = () => this.storage.get('network')
      .then(network => {
          this.globals.network = this.navParams.get('network') ? this.navParams.get('network') : network ? network : this.globals.DEFAULT_NETWORK
          this.network = this.globals.network;
          this.event.publish('network_update', { network: this.network })
          return network;
      });*/

      loadNetwork = () => {
        //this.network = this.globals.network;
        return this.network;
      }

  //switchTheme = e => this.nav.push("ThemeSwitcherPage")

  //login = () => this.nav.push("ImportWalletPage")

  //loginFromMobile = () => this.nav.push("ImportWalletMobilePage")

  //loginXpub = () => this.nav.push("LoginXpubPage")

  //howToMobile = () => this.nav.push("HowToMobilePage")

  LoginAccount(account) {
      if (account.content) {
          //this.LoginAccountPage(account)
      } else {
          //this.loginAccountViewOnly(account)
      }
  }

  //LoginAccountPage = (account) => this.nav.push("LoginAccountPage", { account: account })

  loginAccountViewOnly(account) {
      let account_name = account.name
      let content = account.view_only_content
      /*this.alert.showLoading()
          .then(() => this.wallet.getWalletFromMasterPublicKey(content.xpub))
          .then((wallet) => this.wallet.generateAddresses(wallet, 0, account.params.index || this.globals.index))
          .then((addresses) => this.mvs.addAddresses(addresses))
          .then(() => this.wallet.setupViewOnlyAccount(account_name, content))
          .then(() => this.alert.stopLoading())
          .then(() => this.nav.setRoot("LoadingPage", { reset: true }))
          .catch((error) => {
              console.error(error.message)
              this.alert.stopLoading()
              switch (error.message) {
                  case "ERR_DECRYPT_WALLET":
                      this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                      break;
                  case "ERR_ACCOUNT_NAME_UNKNOWN":
                      this.alert.showError('MESSAGE.ERR_ACCOUNT_NAME_UNKNOWN', '')
                      break;
                  default:
                      this.alert.showError('MESSAGE.ERR_IMPORT_ACCOUNT', error.message)
                      break;
              }
          })*/
  }

}
