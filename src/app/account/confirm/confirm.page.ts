import { Component, OnInit } from '@angular/core'
import { WalletService } from 'src/app/services/wallet.service'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { Router } from '@angular/router'
import { AlertService } from 'src/app/services/alert.service'

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.page.html',
  styleUrls: ['./confirm.page.scss'],
})
export class ConfirmPage implements OnInit {

  hexTx: any
  decodedTx: any
  displayedTx: any
  passphrase = ''
  input: string
  signedTx: string
  mode = 'default'
  status: string
  allMyInputs = true
  addresses: Array<string> = []
  multisig: any = {}
  walletType = 'hasSeed'
  showAdvanced = false

  constructor(
    public mvs: MetaverseService,
    private router: Router,
    private walletService: WalletService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
  }

  async ionViewDidEnter() {
    this.hexTx = history.state.data ? history.state.data.tx : undefined
    if (this.hexTx === undefined) {
      this.router.navigate(['account', 'portfolio'])
    } else {
      this.decodeAndOrganize(this.hexTx)
    }

    const addresses = await this.mvs.getAddresses()
    const multisigAddresses = await this.walletService.getMultisigAddresses()
    this.addresses = addresses.concat(multisigAddresses)

    this.walletService.hasSeed()
      .then((hasSeed) => {
        if (hasSeed) {
          this.walletType = 'hasSeed'
        } else {
          this.walletType = 'readOnly'
        }
      })
  }

  cancel() {
    this.router.navigate(['account', 'portfolio'])
  }

  home(e) {
    this.router.navigate(['account', 'portfolio'])
  }

  async preview() {
    await this.alertService.showLoading()
    try {
      const tx = await this.sign()
      this.signedTx = await tx.encode().toString('hex')
      this.hexTx = this.signedTx
      this.decodeAndOrganize(this.signedTx)
      this.alertService.stopLoading()
    } catch (error) {
      this.alertService.stopLoading()
      console.error(error.message)
    }
  }

  async decodeAndOrganize(tx) {
    // decodedTx is the tx to sign and send
    this.decodedTx = await this.mvs.decodeTx(tx)

    // displayedTx contains more information usefull for the display
    this.displayedTx = await this.mvs.organizeTx(JSON.parse(JSON.stringify(this.decodedTx)))

    this.checkTxSignStatus(this.displayedTx)
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

  sign() {
    if (this.multisig.status === 'MULTISIG') {
      return this.walletService.signMultisigTx(this.decodedTx.inputs[0].address, this.decodedTx, this.passphrase)
        .catch((error) => {
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
            case 'SIGN_ALREADY_INCL':
              this.alertService.showError('CONFIRM.MESSAGE.ALREADY_SIGN_TRANSACTION', '')
              throw Error('ERR_SIGN_TX')
            default:
              this.alertService.showError('CONFIRM.MESSAGE.SIGN_TRANSACTION', error.message)
              throw Error('ERR_SIGN_TX')
          }
        })
    } else {
      return this.mvs.sign(this.decodedTx, this.passphrase, this.allMyInputs)
        .catch((error) => {
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
        })
    }
  }

  async checkTxSignStatus(tx) {
    let foundSignedInput = false
    let foundUnisgnedInput = false

    let foundNotMultisigInput = false
    let foundMultisigInput = false
    let multisigAddress = ''
    let differentMultisigAddressesInput = false

    for (let i = 0; i < tx.inputs.length; i++) {
      const input = tx.inputs[i]

      if (input.address[0] === '3') {
        foundMultisigInput = true
        this.multisig.current_nbr_sign = input.script.split('[').length - 2
        this.multisig.info = await this.getMultisigInfo(input.address)
        const signatureStatus = await this.mvs.getSignatureStatus(this.decodedTx, i, this.multisig.info.r, this.multisig.info.s)
        this.multisig.selfSigned = signatureStatus.targetSigned
        if (!signatureStatus.complete) {
          foundUnisgnedInput = true
        } else {
          foundSignedInput = true
        }

        if (multisigAddress && multisigAddress !== input.address) {
          differentMultisigAddressesInput = true
        } else {
          multisigAddress = input.address
        }

      } else {
        foundNotMultisigInput = true
        if (input.script) {
          foundSignedInput = true
        } else {
          foundUnisgnedInput = true
        }
      }

      if (this.addresses.indexOf(input.previous_output.address) === -1) {
        this.allMyInputs = false
      }
    }

    if (foundSignedInput && !foundUnisgnedInput) {
      this.status = 'SIGNED'
    } else if (!foundSignedInput && foundUnisgnedInput) {
      this.status = 'UNSIGNED'
    } else {
      this.status = 'PARTIALLY'
    }

    if (differentMultisigAddressesInput) {
      // contains multiples multisig addresses as inputs (not supported)
      this.multisig.status = 'MIX_MULTISIG'
    } else if (foundMultisigInput && !foundNotMultisigInput) {
      this.multisig.status = 'MULTISIG'

    } else if (!foundMultisigInput && foundNotMultisigInput) {
      this.multisig.status = 'NOT_MULTISIG'
    } else {
      // contains multisig and normal address as input (not supported)
      this.multisig.status = 'PARTIALLY_MULTISIG'
    }

  }

  async getMultisigInfo(address) {
    const multisigs = await this.walletService.getMultisigsInfo()
    let multisigInfo = {}
    multisigs.forEach(multisig => {
      if (multisig.a === address) {
        multisigInfo = multisig
      }
    })
    return multisigInfo
  }

  validPassword = (passphrase) => (passphrase.length > 0)

}
