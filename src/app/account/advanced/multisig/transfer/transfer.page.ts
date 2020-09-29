import { Component, OnInit, ViewChild } from '@angular/core'
import { Platform, ModalController } from '@ionic/angular'
import { ActivatedRoute, Router } from '@angular/router'
import { ScanPage } from 'src/app/scan/scan.page'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { AlertService } from 'src/app/services/alert.service'
import { AppService } from 'src/app/services/app.service'
import { WalletService } from 'src/app/services/wallet.service'

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.page.html',
  styleUrls: ['./transfer.page.scss'],
})
export class TransferPage implements OnInit {

  selectedAsset: any
  addresses: Array<string>
  balance: number
  decimals: number
  showBalance: number
  recipient_address = ''
  recipient_avatar: string
  recipient_avatar_valid: boolean
  quantity = ''
  rawtx: string
  addressbalances: Array<any>
  sendFrom = 'auto'
  changeAddress: string
  feeAddress = 'auto'
  passphrase = ''
  etpBalance: number
  @ViewChild('recipientAddressInput') recipientAddressInput
  @ViewChild('quantityInput') quantityInput
  total_to_send: any = {}
  sendMoreValidQuantity = false
  sendMoreValidAddress = false
  sendMore_limit = 1000
  total: number
  message = ''
  fee: number
  type = 'create'
  input: string
  signedTx: string
  address_info: any
  sendToAvatar: string = null
  isMobile: boolean
  showAdvanced = false

  constructor(
    private metaverseService: MetaverseService,
    public platform: Platform,
    private alertService: AlertService,
    private globals: AppService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public walletService: WalletService,
    private modalCtrl: ModalController,
  ) {

    this.selectedAsset = this.activatedRoute.snapshot.params.asset
    this.sendFrom = this.activatedRoute.snapshot.params.address
    this.total_to_send[this.selectedAsset] = 0
    this.total = 0
    this.isMobile = this.walletService.isMobile()

    // Load addresses
    metaverseService.getAddresses()
      .then((_: Array<string>) => {
        this.addresses = _
      })

    this.metaverseService.getAddressBalances()
      .then((addressbalances) => {
        if (!addressbalances[this.sendFrom]) {
          addressbalances[this.sendFrom] = {}
          addressbalances[this.sendFrom].AVATAR = ''
          addressbalances[this.sendFrom].ETP = {}
          addressbalances[this.sendFrom].ETP.available = 0
          addressbalances[this.sendFrom].ETP.frozen = 0
          addressbalances[this.sendFrom].ETP.decimals = 8
          addressbalances[this.sendFrom].MIT = []
          addressbalances[this.sendFrom].MST = {}
        }
        this.decimals = (this.selectedAsset === 'ETP') ?
          addressbalances[this.sendFrom].ETP.decimals :
          addressbalances[this.sendFrom].MST[this.selectedAsset].decimals
        this.etpBalance = addressbalances[this.sendFrom].ETP.available
        const addrblncs = []
        this.showBalance = this.selectedAsset === 'ETP' ?
          addressbalances[this.sendFrom].ETP.available :
          addressbalances[this.sendFrom].MST[this.selectedAsset].available
        if (Object.keys(addressbalances).length) {
          Object.keys(addressbalances).forEach((address) => {
            if (this.selectedAsset === 'ETP') {
              if (addressbalances[address].ETP.available > 0) {
                addrblncs.push({
                  address,
                  avatar: addressbalances[address].AVATAR ? addressbalances[address].AVATAR : '',
                  identifier: addressbalances[address].AVATAR ? addressbalances[address].AVATAR : address,
                  balance: addressbalances[address].ETP.available
                })
              }
            } else {
              if (addressbalances[address].MST[this.selectedAsset] && addressbalances[address].MST[this.selectedAsset].available) {
                addrblncs.push({
                  address,
                  avatar: addressbalances[address].AVATAR ? addressbalances[address].AVATAR : '',
                  identifier: addressbalances[address].AVATAR ? addressbalances[address].AVATAR : address,
                  balance: addressbalances[address].MST[this.selectedAsset].available
                })
              }
            }
          })
        }
        this.addressbalances = addrblncs

      })

    this.walletService.getMultisigInfoFromAddress(this.sendFrom)
      .then((info) => this.address_info = info)

    this.fee = this.globals.default_fees.default
    this.metaverseService.getFees()
      .then(fees => this.fee = fees.default)
  }

  ngOnInit(): void {

  }

  async sendAll() {
    const confirm = await this.alertService.alertConfirm(
      'SEND_SINGLE.ALL.TITLE',
      'SEND_SINGLE.ALL.SUBTITLE',
      'SEND_SINGLE.ALL.CANCEL',
      'SEND_SINGLE.ALL.OK'
    )
    if (confirm) {
      if (this.selectedAsset === 'ETP') {
        this.quantity = parseFloat(((this.showBalance / 100000000 - this.fee / 100000000).toFixed(this.decimals)) + '') + ''
      } else {
        this.quantity = parseFloat((this.showBalance / Math.pow(10, this.decimals)).toFixed(this.decimals) + '') + ''
      }
      this.quantityInput.setFocus()
    }
  }

  validrecipient = (address) => this.metaverseService.validAddress(address)

  ionViewDidEnter() {
    this.metaverseService.getAddresses()
      .then((addresses) => {
        if (!Array.isArray(addresses) || !addresses.length) {
          this.router.navigate(['/'])
        }
      })
  }

  validQuantity = (quantity) => quantity !== undefined
    && this.countDecimals(quantity) <= this.decimals
    && (quantity > 0)
    && ((this.selectedAsset === 'ETP' && this.showBalance >= (Math.round(parseFloat(quantity) * Math.pow(10, this.decimals)) + this.fee))
      || (this.selectedAsset !== 'ETP' && this.showBalance >= parseFloat(quantity) * Math.pow(10, this.decimals)))

  countDecimals(value) {
    if (Math.floor(value) !== value && value.toString().split('.').length > 1) {
      return value.toString().split('.')[1].length || 0
    }
    return 0
  }

  preview() {
    this.create()
      .then((tx) => {
        this.rawtx = tx.encode().toString('hex')
        this.alertService.stopLoading()
      })
      .catch((error) => {
        this.alertService.stopLoading()
      })
  }

  create() {
    return this.alertService.showLoading()
      .then(() => this.metaverseService.getAddresses())
      .then((addresses) => {
        const messages = []
        if (this.message) {
          messages.push(this.message)
        }
        return this.metaverseService.createSendMultisigTx(
          this.passphrase,
          this.selectedAsset,
          this.recipient_address,
          (this.recipient_avatar && this.recipient_avatar_valid) ? this.recipient_avatar : undefined,
          Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals)),
          this.sendFrom,
          (this.showAdvanced && this.changeAddress !== 'auto') ? this.changeAddress : undefined,
          (this.showAdvanced) ? this.fee : 10000,
          (this.showAdvanced && messages !== []) ? messages : undefined,
          this.address_info
        )
      })
      .catch((error) => {
        console.error(error.message)
        this.alertService.stopLoading()
        switch (error.message) {
          case 'ERR_DECRYPT_WALLET':
            this.alertService.showError('MESSAGE.PASSWORD_WRONG', '')
            throw Error('ERR_CREATE_TX')
          case 'ERR_INSUFFICIENT_BALANCE':
            this.alertService.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
            throw Error('ERR_CREATE_TX')
          case 'ERR_TOO_MANY_INPUTS':
            this.alertService.showErrorTranslated('ERROR_TOO_MANY_INPUTS', 'ERROR_TOO_MANY_INPUTS_TEXT')
            throw Error('ERR_CREATE_TX')
          default:
            this.alertService.showError('MESSAGE.CREATE_TRANSACTION', error.message)
            throw Error('ERR_CREATE_TX')
        }
      })
  }

  send() {
    this.create()
      .then(tx => this.metaverseService.send(tx))
      .then((result) => {
        // this.navCtrl.pop()
        this.alertService.stopLoading()
        // this.alert.showSent('SUCCESS_SEND_TEXT', result.hash)
      })
      .catch((error) => {
        console.error(error)
        this.alertService.stopLoading()
        switch (error.message) {
          case 'ERR_CONNECTION':
            this.alertService.showError('ERROR_SEND_TEXT', '')
            break
          case 'ERR_CREATE_TX':
            // already handle in create function
            break
          default:
            this.alertService.showError('MESSAGE.BROADCAST_ERROR', error.message)
        }
      })
  }

  validAvatar = (input: string) => /[A-Za-z0-9.-]/.test(input) && this.recipient_avatar_valid

  recipientChanged = () => {
    if (this.recipient_address) {
      this.recipient_address = this.recipient_address.trim()
    }
  }

  recipientAvatarChanged = () => {
    if (this.recipient_avatar) {
      this.recipient_avatar = this.recipient_avatar.trim()
      Promise.all([this.metaverseService.getGlobalAvatar(this.recipient_avatar), this.recipient_avatar])
        .then(result => {
          if (this.recipient_avatar !== result[1]) {
            throw new Error('')
          }
          this.recipient_avatar_valid = true
          this.recipient_address = result[0].address
          this.recipientChanged()
        })
        .catch((e) => {
          this.recipient_avatar_valid = false
          this.recipient_address = ''
          this.recipientChanged()
        })
    }
  }

  validPassword = (passphrase) => (passphrase.length > 0)

  validMessageLength = (message) => this.metaverseService.verifyMessageSize(message) < 253

  async scan() {
    const modal = await this.modalCtrl.create({
      component: ScanPage,
      showBackdrop: false,
      backdropDismiss: false,
    })
    modal.onWillDismiss().then(result => {
      if (result.data && result.data.text) {
        const codeContent = result.data.text.toString()
        const content = codeContent.toString().split('&')
        if (this.metaverseService.validAddress(content[0])) {
          this.recipient_address = content[0]
          this.recipientAddressInput.setFocus()
        } else {
          this.alertService.showMessage('SCAN.INVALID_ADDRESS.TITLE', 'SCAN.INVALID_ADDRESS.SUBTITLE', '')
        }
      }
      modal.remove()
    })
    await modal.present()
  }

  decode(tx) {
    this.metaverseService.decodeTx(tx)       // Try if the transaction can be decoded, if not, shows an error
      .then(() => this.router.navigate(['account', 'confirm'], { state: { data: { tx } } }))
      .catch((error) => {
        console.error(error)
        this.alertService.showErrorTranslated('MULTISIG.MESSAGE.ERROR_DECODE_MULTISIG_SUBTITLE', 'MULTISIG.MESSAGE.ERROR_DECODE_MULTISIG_BODY')
      })
  }

}
