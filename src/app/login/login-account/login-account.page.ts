import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { LoadingController, AlertController } from '@ionic/angular'
import { WalletService } from 'src/app/services/wallet.service'
import { MetaverseService } from '../../services/metaverse.service'
import { Router } from '@angular/router'
import { AccountService } from '../../services/account.service'
import { AlertService } from '../../services/alert.service'

@Component({
  selector: 'app-login-account',
  templateUrl: './login-account.page.html',
  styleUrls: ['./login-account.page.scss'],
})
export class LoginAccountPage implements OnInit {

  form: FormGroup
  account: any
  loader: any

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private loadingCtrl: LoadingController,
    private walletService: WalletService,
    public metaverse: MetaverseService,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
  ) {
    this.account = this.activatedRoute.snapshot.queryParams
  }

  async ngOnInit() {

    this.form = this.formBuilder.group({
      passphrase: new FormControl('', [Validators.required, Validators.minLength(4)])
    })

    this.loader = await this.loadingCtrl.create({
      animated: true,
      spinner: 'crescent',
      message: await this.translate.get('CREATE_WALLET.GENERATING_TEXT').toPromise(),
    })

  }


  async importAccount(account) {
    await this.loader.present()
    const passphrase = this.form.value.passphrase
    const decryptedAccount = await this.accountService.decryptAccount(account.content, passphrase)
    await this.walletService.import(decryptedAccount.wallet, passphrase, this.metaverse.network)
    await this.accountService.saveSessionAccount(passphrase)
    await this.accountService.setAccountName(account.name)
    await this.loader.dismiss()
    return this.router.navigate(['/account'])
  }

  async forgetAccount() {
    const alert = await this.alertService.alert('LOGIN_ACCOUNT', 'FORGET', 'TITLE', 'TEXT', ['BACK', 'FORGET'])

    alert.onDidDismiss().then((data) => {
      if (data.data === 'FORGET') {
        return this.accountService.deleteAccount(this.account.name).then(() => this.router.navigate(['/login']))
      }
    })
  }

}
