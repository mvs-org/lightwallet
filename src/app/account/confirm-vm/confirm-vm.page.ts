import { Component, OnInit } from '@angular/core'
import { WalletService } from 'src/app/services/wallet.service'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { Router } from '@angular/router'
import { AlertService } from 'src/app/services/alert.service'
import { VmService } from '../../services/vm.service'

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm-vm.page.html',
  styleUrls: ['./confirm-vm.page.scss'],
})
export class ConfirmVmPage implements OnInit {

  hexTx: any
  params: any
  passphrase = ''
  signedTx: any
  showAdvanced = false
  status: string
  vmAddress: any = {}

  constructor(
    public mvs: MetaverseService,
    private router: Router,
    public walletService: WalletService,
    private alertService: AlertService,
    public vmService: VmService,
  ) { }

  ngOnInit() {
  }

  async ionViewDidEnter() {
    this.params = history.state.data ? history.state.data.params : undefined
    if (this.params === undefined) {
      this.router.navigate(['account', 'portfolio'])
    } else {
      const vmAddresses = await this.walletService.getVmAddresses()
      this.vmAddress = vmAddresses[0] || {}
    }
  }

  cancel() {
    this.router.navigate(['account', 'portfolio'])
  }

  home(e) {
    this.router.navigate(['account', 'portfolio'])
  }

  async send() {
    try {
      await this.alertService.showLoading()
      const tx = await this.sign()
      await this.broadcast(tx)
    } catch (error) { }
  }

  async broadcastOnly(tx) {
    try {
      await this.alertService.showLoading()
      await this.broadcast(tx)
    } catch (error) { }
  }

  async broadcast(tx) {
    try {
      const result = await this.mvs.send(tx)
      this.alertService.stopLoading()
      this.router.navigate(['account', 'portfolio'])
      this.alertService.showMessage(
        'CONFIRM.CONFIRM_ALERT.TITLE',
        'CONFIRM.CONFIRM_ALERT.SUBTITLE',
        result.hash,
        'CONFIRM.CONFIRM_ALERT.OK')
    } catch (error) {
      this.alertService.stopLoading()
      console.error(error.message)
      switch (error.message) {
        case 'ERR_CONNECTION':
          this.alertService.showError('CONFIRM.MESSAGE.ERROR_SEND_TEXT', '')
          break
        case 'ERR_SIGN_TX':
          // already handle in create function
          break
        default:
          this.alertService.showError('CONFIRM.MESSAGE.BROADCAST_TRANSACTION', error.message)
          throw Error('ERR_BROADCAST_TX')
      }
    }
  }

  async sign() {
    try {
      this.signedTx = await this.vmService.sign(this.params, this.passphrase)
      this.hexTx = this.signedTx.rawTransaction
      return this.signedTx
    } catch (error) {
      console.error(error.message)
      this.alertService.stopLoading()
      switch (error.message) {
        case 'ERR_DECRYPT_WALLET':
          this.alertService.showError('CONFIRM.MESSAGE.PASSWORD_WRONG', '')
          throw Error('ERR_SIGN_TX')
        case 'ERR_DECRYPT_WALLET_FROM_SEED':
          this.alertService.showError('CONFIRM.MESSAGE.PASSWORD_WRONG', '')
          throw Error('ERR_SIGN_TX')
        case 'ERR_INSUFFICIENT_BALANCE':
          this.alertService.showError('CONFIRM.MESSAGE.INSUFFICIENT_BALANCE', '')
          throw Error('ERR_SIGN_TX')
        case 'ERR_TOO_MANY_INPUTS':
          this.alertService.showErrorTranslated('CONFIRM.MESSAGE.ERROR_TOO_MANY_INPUTS', 'CONFIRM.MESSAGE.ERROR_TOO_MANY_INPUTS_TEXT')
          throw Error('ERR_SIGN_TX')
        default:
          this.alertService.showError('CONFIRM.MESSAGE.SIGN_TRANSACTION', error.message)
          throw Error('ERR_SIGN_TX')
      }
    }
  }

  validPassword = (passphrase) => (passphrase.length > 0)

  async submit() {
    try {
      await this.alertService.showLoading()
      const signTx = await this.sign()
      await this.vmService.send(signTx)
      this.alertService.stopLoading()
      this.router.navigate(['account', 'portfolio'])
      this.alertService.showMessage(
        'CONFIRM.CONFIRM_ALERT.TITLE',
        'CONFIRM.CONFIRM_ALERT.SUBTITLE',
        '',
        'CONFIRM.CONFIRM_ALERT.OK')
    } catch (error) {
      this.alertService.stopLoading()
      console.error(error.message)
      switch (error.message) {
        case 'ERR_CONNECTION':
          this.alertService.showError('CONFIRM.MESSAGE.ERROR_SEND_TEXT', '')
          break
        case 'ERR_SIGN_TX':
          // already handle in create function
          break
        default:
          this.alertService.showError('CONFIRM.MESSAGE.BROADCAST_TRANSACTION', error.message)
          throw Error('ERR_BROADCAST_TX')
      }
    }
  }

}
