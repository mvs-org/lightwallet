import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { WalletService } from 'src/app/services/wallet.service'
import { AlertService } from 'src/app/services/alert.service'

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {

  wallet: any
  isApp = !document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080')

  constructor(
    private walletService: WalletService,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private router: Router,
    private alertService: AlertService,
  ) { }

  async ngOnInit() {
    await this.alertService.showLoading('CREATE_WALLET.GENERATING_TEXT')
    this.wallet = await this.walletService.createWallet()
    this.alertService.stopLoading()
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
