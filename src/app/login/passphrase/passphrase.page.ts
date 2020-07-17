import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { FormGroup, FormControl, AbstractControl, Validators, FormBuilder } from '@angular/forms'
import { WalletService } from 'src/app/services/wallet.service'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { Platform, LoadingController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { CryptoService } from 'src/app/services/crypto.service'
import { AppService } from 'src/app/services/app.service'
import { AlertService } from 'src/app/services/alert.service'

@Component({
  selector: 'app-passphrase',
  templateUrl: './passphrase.page.html',
  styleUrls: ['./passphrase.page.scss'],
})
export class PassphrasePage implements OnInit {

  form: FormGroup

  mnemonic: string = history.state.data && history.state.data.mnemonic ? history.state.data.mnemonic : ''
  loading: boolean

  isMobile: boolean

  constructor(
    private globals: AppService,
    public translate: TranslateService,
    private crypto: CryptoService,
    public platform: Platform,
    public mvs: MetaverseService,
    public loadingCtrl: LoadingController,
    public wallet: WalletService,
    private formBuilder: FormBuilder,
    private router: Router,
    private alertService: AlertService,
  ) { }


  ngOnInit() {
    this.isMobile = this.wallet.isMobile()
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

  async downloadAndReturnLogin() {
    await this.download()
    this.router.navigate(['/'])
  }

  /* encypts mnemonic with authentication provider encypt function
   * then writes the data to the json file and downloads the file
   */
  async download() {
    const password = this.form.value.passphrase
    try {
      const res = await this.crypto.encrypt(this.mnemonic, password)
      const encrypted = await this.dataToKeystoreJson(res)
      this.downloadFile('mvs_keystore.json', JSON.stringify(encrypted))
    } catch (error) {
      console.log(error)
    }
  }

  async encrypt() {
    const password = this.form.value.passphrase
    try {
      const seed = await this.wallet.setSeedMobile(password, this.mnemonic)
      await this.wallet.setMobileWallet(seed)
      const wallet = await this.wallet.getWallet(password)
      const addresses = await this.wallet.generateAddresses(wallet, 0, this.globals.index)
      await this.mvs.setAddresses(addresses)
      const xpub = await this.wallet.getMasterPublicKey(password)
      await this.wallet.setXpub(xpub)
      await this.wallet.saveSessionAccount(password)
      this.router.navigate(['/loading'], { state: { data: { reset: true } } })
    } catch (error) {
      console.error(error)
      switch (error) {
        case 'illegal mnemonic':
          this.alertService.showError('SELECT_PASSPHRASE.MESSAGE.ERROR_MNEMONIC', '')
          break
        default:
          this.alertService.showError('SELECT_PASSPHRASE.MESSAGE.ERROR', error.message)
      }
    }
  }

  passwordValid = (password) => (password) ? password.length > 5 : false

  passwordRepeatValid = (password, passwordrepeat) => (passwordrepeat) ? passwordrepeat.length > 5 && passwordrepeat === password : false

  complete = (password, passwordRepeat) =>
    (password && passwordRepeat) ? this.passwordValid(password) && password === passwordRepeat : false

  downloadFile(filename, text) {
    const pom = document.createElement('a')
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    pom.setAttribute('download', filename)

    if (document.createEvent) {
      const event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      pom.dispatchEvent(event)
    }
    else {
      pom.click()
    }
  }

  dataToKeystoreJson(mnemonic) {
    const tmp = { version: this.globals.version, algo: this.globals.algo, index: this.globals.index, mnemonic }
    return tmp
  }

}
