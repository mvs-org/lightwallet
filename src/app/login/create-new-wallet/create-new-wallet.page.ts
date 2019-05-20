import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { GeneratedWallet, WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-create-new-wallet',
  templateUrl: './create-new-wallet.page.html',
  styleUrls: ['./create-new-wallet.page.scss'],
})
export class CreateNewWalletPage implements OnInit {

  wallet: GeneratedWallet;

  constructor(
    public config: ConfigService,
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
    });
    await loader.present();
    this.wallet = await this.walletService.generateWallet();
    await loader.dismiss();
  }

  enterPassphrase() {
    this.router.navigate(['login', 'select-passphrase'],
      {
        skipLocationChange: true,
        queryParams: this.wallet
      });
  }

  async confirmBackup() {
    const translations = await this.translate.get([
      'TITLE',
      'TEXT',
      'BUTTON.YES',
      'BUTTON.NO',
    ].map(key => 'CREATE_WALLET.CONFIRM_BACKUP.' + key)).toPromise();
    const alert = await this.alertCtrl.create({
      header: translations['CREATE_WALLET.CONFIRM_BACKUP.TITLE'],
      message: translations['CREATE_WALLET.CONFIRM_BACKUP.TEXT'],
      buttons: [
        {
          text: translations['CREATE_WALLET.CONFIRM_BACKUP.BUTTON.NO']
        }, {
          text: translations['CREATE_WALLET.CONFIRM_BACKUP.BUTTON.YES'],
          handler: () => this.enterPassphrase()
        }
      ]
    });
    alert.present();

  }

}
