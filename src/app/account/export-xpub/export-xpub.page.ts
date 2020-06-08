import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service'
import { AlertService } from '../../services/alert.service'

@Component({
  selector: 'app-export-xpub',
  templateUrl: './export-xpub.page.html',
  styleUrls: ['./export-xpub.page.scss'],
})
export class ExportXpubPage implements OnInit {

  xpub = ''
  passphrase = ''

  constructor(
    private walletService: WalletService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
  }

  async export(passphrase: string) {
      try {
          this.xpub = await this.walletService.getMasterPublicKey(passphrase)
      } catch (error) {
          switch (error.message) {
              case 'ERR_DECRYPT_WALLET_FROM_SEED':
                  return this.alertService.showError('MESSAGE.PASSWORD_WRONG', '')
              default:
                  console.error(error)
                  return this.alertService.showError('Unknown Error', error.message)
          }
      }
  }

  validPassword = (passphrase) => (passphrase && passphrase.length > 0)

}
