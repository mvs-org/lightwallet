import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { WalletService } from 'src/app/services/wallet.service';
import { MetaverseService } from '../../services/metaverse.service';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';

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
  ) {
    this.account = this.activatedRoute.snapshot.queryParams
    
  }

  async ngOnInit() {

    this.form = this.formBuilder.group({
      passphrase: new FormControl('', [Validators.required, Validators.minLength(4)])
    });

    this.loader = await this.loadingCtrl.create({
      animated: true,
      spinner: 'crescent',
      message: await this.translate.get('CREATE_WALLET.GENERATING_TEXT').toPromise(),
    });
    //await loader.present();

    //await loader.dismiss();

  }


  async importAccount(account, password) {
    /*await this.loader.present();
    let decryptedAccount = await this.account.decryptAccount(account.content, password)
    await this.account.setupAccount(account.name, decryptedAccount)
    let wallet = await this.walletService.getHDNode(password, this.metaverse.network);
    let index = await this.walletService.getAddressIndex()
    let addresses = await this.walletService.generateAddresses(wallet, 0, index)
    await this.mvs.addAddresses(addresses)
      .then(() => this.account.saveSessionAccount(password))
      .then(() => this.alert.stopLoading())
      .then(() => this.nav.setRoot("LoadingPage", { reset: true }))*/
    const passphrase = this.form.value.passphrase;
    console.log(account.content)
    console.log(passphrase)
    let decryptedAccount = await this.accountService.decryptAccount(account.content, passphrase)
    console.log(decryptedAccount)
    await this.walletService.import(decryptedAccount.wallet, passphrase, this.metaverse.network);
    console.log("Import completed")
    await this.account.saveSessionAccount(passphrase)
    return this.router.navigate(['/account']);

  }

  /*deleteAccount(account_name) {
    this.translate.get('DELETE_ACCOUNT_TITLE').subscribe(title => {
      this.translate.get(this.platform.is('mobile') ? 'RESET_MESSAGE_MOBILE_SAVE_ACCOUNT' : 'DELETE_ACCOUNT_BODY').subscribe(message => {
        this.translate.get('DELETE').subscribe(no => {
          this.translate.get('BACK').subscribe(back => {
            let confirm = this.alertCtrl.create({
              title: title,
              message: message,
              buttons: [
                {
                  text: back,
                  handler: () => {
                    console.log('Disagree clicked')
                  }
                },
                {
                  text: no,
                  handler: () => {
                    this.wallet.deleteAccount(account_name).then(() => {
                      this.nav.setRoot("LoginPage")
                    })
                  }
                },

              ]
            });
            confirm.present()
          })
        })
      })
    })
  }*/

}
