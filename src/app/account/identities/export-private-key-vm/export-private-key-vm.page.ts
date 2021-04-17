import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service'
import { AlertService } from 'src/app/services/alert.service'
import { VmService } from 'src/app/services/vm.service'

@Component({
  selector: 'app-export-private-key-vm',
  templateUrl: './export-private-key-vm.page.html',
  styleUrls: ['./export-private-key-vm.page.scss'],
})
export class ExportPrivateKeyVmPage implements OnInit {

  privateKey = ''
  passphrase = ''

  constructor(
    public walletService: WalletService,
    private alertService: AlertService,
    public vmService: VmService,
  ) { }

  ngOnInit() {
  }

  async export(passphrase: string) {
      try {
          this.privateKey = await this.vmService.getPrivateKey(passphrase)
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
