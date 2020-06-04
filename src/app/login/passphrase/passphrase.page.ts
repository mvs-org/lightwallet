import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { FormGroup, FormControl, AbstractControl, Validators, FormBuilder } from '@angular/forms'
import { WalletService } from 'src/app/services/wallet.service'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { Platform, LoadingController, AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { CryptoService } from 'src/app/services/crypto.service'
import { AppService } from 'src/app/services/app.service'

@Component({
  selector: 'app-passphrase',
  templateUrl: './passphrase.page.html',
  styleUrls: ['./passphrase.page.scss'],
})
export class PassphrasePage implements OnInit {

  form: FormGroup

  mnemonic: string = this.activatedRoute.snapshot.queryParams.mnemonic
  loading: boolean

  isApp = false

  constructor(
    private globals: AppService,
    private activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    private crypto: CryptoService,
    public platform: Platform,
    public mvs: MetaverseService,
    public loadingCtrl: LoadingController,
    public wallet: WalletService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }


  ngOnInit(){
    const passphrase = new FormControl('', [Validators.required, Validators.minLength(8)])
    const repeat = new FormControl('', [Validators.required])
    this.form = this.formBuilder.group({
      passphrase,
      repeat,
    }, {
        validators: [this.isSame(passphrase, repeat)],
      })
  }

  isSame(targetControl: AbstractControl, checkControl: FormControl) {
    return () => checkControl.value === targetControl.value ? null : { notSame: true }
  }

  getError(control: AbstractControl, group?: FormGroup) {
    if (control.pristine) {
      return
    }
    if (control.errors) {
      return Object.entries(control.errors)[0]
    }
    if (group !== undefined && group.errors) {
      return Object.entries(group.errors)[0]
    }
    return
  }

  async submit() {
    const passphrase = this.form.value.passphrase
    if (this.platform.is('mobile')) {
      await this.encrypt(passphrase)
    } else {
      this.downloadAndReturnLogin(passphrase)
    }
  }



  downloadAndReturnLogin(password) {
    this.download(password)
    this.router.navigate(['/'])
  }

  /* encypts mnemonic with authentication provider encypt function
   * then writes the data to the json file and downloads the file
   */
  download(password) {
    this.crypto.encrypt(this.mnemonic, password)
      .then((res) => this.dataToKeystoreJson(res))
      .then((encrypted) => this.downloadFile('mvs_keystore.json', JSON.stringify(encrypted)))
      .catch((error) => {
        console.log(error)
      });
  }

  encrypt(password) {
    console.log('create encrypted wallet record')
    this.wallet.setSeedMobile(password, this.mnemonic)
      .then((seed) => this.wallet.setMobileWallet(seed))
      .then(() => this.wallet.getWallet(password))
      .then((wallet) => this.wallet.generateAddresses(wallet, 0, this.globals.index))
      .then((addresses) => this.mvs.setAddresses(addresses))
      .then(() => this.wallet.getMasterPublicKey(password))
      .then((xpub) => this.wallet.setXpub(xpub))
      .then(() => this.wallet.saveSessionAccount(password))
      .then(()=>this.router.navigate(['/account']))
      .catch((e) => {
        console.error(e);
      });
  }

  passwordValid = (password) => (password) ? password.length > 5 : false;

  passwordRepeatValid = (password, password_repeat) => (password_repeat) ? password_repeat.length > 5 && password_repeat == password : false;

  complete = (password, password_repeat) => (password && password_repeat) ? this.passwordValid(password) && password == password_repeat : false;

  downloadFile(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
    }
    else {
      pom.click();
    }
  }

  dataToKeystoreJson(mnemonic) {
    let tmp = { version: this.globals.version, algo: this.globals.algo, index: this.globals.index, mnemonic: mnemonic };
    return tmp;
  }

}
