import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { LoadingController, AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { WalletService } from 'src/app/services/wallet.service'

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {

  wallet: any
  isApp = false

  constructor(
    private walletService: WalletService,
    private loadingCtrl: LoadingController,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private router: Router,
  ) { }

  async ngOnInit() {
    const loader = await this.loadingCtrl.create({
      animated: true,
      spinner: 'crescent',
      message: await this.translate.get('CREATE_WALLET.GENERATING_TEXT').toPromise(),
    })
    await loader.present()
    this.wallet = await this.walletService.createWallet()
    await loader.dismiss()
  }

  enterPassphrase() {
    this.router.navigate(['login', 'passphrase'], { state: { data: { mnemonic: this.wallet.mnemonic } } })
  }

  async confirmBackup() {
    const translations = await this.translate.get([
      'TITLE',
      'TEXT',
      'BUTTON.YES',
      'BUTTON.NO',
    ].map(key => 'CREATE_WALLET.CONFIRM_BACKUP.' + key)).toPromise()
    const alert = await this.alertCtrl.create({
      header: translations['CREATE_WALLET.CONFIRM_BACKUP.TITLE'],
      message: translations['CREATE_WALLET.CONFIRM_BACKUP.TEXT'],
      buttons: [
        {
          text: translations['CREATE_WALLET.CONFIRM_BACKUP.BUTTON.NO'],
        }, {
          text: translations['CREATE_WALLET.CONFIRM_BACKUP.BUTTON.YES'],
          handler: () => this.enterPassphrase(),
        },
      ],
    })
    alert.present()

  }

}
