import { Component, ViewChild, OnInit } from '@angular/core'
import { Platform, ModalController } from '@ionic/angular'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { AppService } from 'src/app/services/app.service'
import { ActivatedRoute, Router } from '@angular/router'
import { Location } from '@angular/common'
import { AlertService } from 'src/app/services/alert.service'
import { WalletService } from 'src/app/services/wallet.service'
import { ScanPage } from 'src/app/scan/scan.page'

class RecipientSendMore {
  constructor(
    public address: string,
    public avatar: string,
    public target: any,
    public attenuation_model: string
  ) { }
}

export const deeplinkRegex = /^.*app\.myetpwallet\.com\/account\/send\/(.+)\?(.*)$/
@Component({
  selector: 'app-send',
  templateUrl: './send.page.html',
  styleUrls: ['./send.page.scss'],
})
export class SendPage implements OnInit {

  selectedAsset: any
  addresses: Array<string>
  balance: number
  decimals: number
  showBalance: number
  recipient_address: string
  recipient_avatar: string
  recipient_avatar_valid: boolean
  quantity = ''
  addressbalances: Array<any>
  sendFrom = 'auto'
  changeAddress: string
  feeAddress = 'auto'
  etpBalance: number
  @ViewChild('recipientAddressInput') recipientAddressInput
  @ViewChild('quantityInput') quantityInput
  transfer_type = 'one'
  recipients: Array<RecipientSendMore> = []
  total_to_send: any = {}
  sendMoreValidQuantity = false
  sendMoreValidAddress = false
  sendMore_limit = 1000
  total: number
  message = ''
  fee: number
  defaultFee: number
  sendMoreValidEachAvatar: Array<boolean> = []
  attenuation_model: string
  lock = false
  isMobile: boolean
  showAdvanced = false
  locktime: number
  addressbalancesObject: any = {}
  base: string
  tickers = {}
  disableParams = false
  params = {
    amount: false,
    recipient_address: false,
    recipient_avatar: false,
    message: false,
  }
  sendToAvatar = false

  constructor(
    private metaverseService: MetaverseService,
    public platform: Platform,
    private alertService: AlertService,
    private appService: AppService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private router: Router,
    private walletService: WalletService,
    private modalCtrl: ModalController,
  ) {
  }

  ngOnInit() {

  }

  initializeParameters(asset: string, params: any) {
    if (this.selectedAsset !== asset) {
      this.alertService.showErrorTranslated('SCAN.DIFFERENT_ASSET.TITLE', 'SCAN.DIFFERENT_ASSET.SUBTITLE')
    } else {
      this.quantity = params.q || params.quantity || params.amount || ''
      this.recipient_address = params.r || params.recipient || ''
      this.recipient_avatar = params.a || params.avatar || ''
      this.message = params.m || params.message || ''
      this.disableParams = params.d === 'true' || params.disableParams === 'true'

      if (history.state.data) {
        this.quantity = history.state.data.quantity || this.quantity
        this.recipient_address = history.state.data.recipient || this.recipient_address
        this.recipient_avatar = history.state.data.avatar || this.recipient_avatar
        this.message = history.state.data.message || this.message
      }

      if (this.recipient_avatar !== '') {
        this.sendToAvatar = true
        this.recipientAvatarChanged()
      }
      this.params.amount = this.quantity !== ''
      this.params.recipient_address = this.recipient_address !== ''
      this.params.recipient_avatar = this.recipient_avatar !== ''
      this.params.message = this.message !== ''
    }
  }

  ionViewWillEnter() {

    this.selectedAsset = this.activatedRoute.snapshot.params.symbol
    this.quantity = ''
    this.addressbalances = []
    this.sendFrom = 'auto'
    this.feeAddress = 'auto'
    this.transfer_type = 'one'
    this.recipients = []
    this.total_to_send = {}
    this.total_to_send[this.selectedAsset] = 0
    this.sendMoreValidQuantity = false
    this.sendMoreValidAddress = false
    this.sendMore_limit = 1000
    this.total = 0
    this.message = ''
    this.sendMoreValidEachAvatar = []
    this.lock = false
    this.isMobile = this.walletService.isMobile()
    this.showAdvanced = false
    this.addressbalancesObject = {}
    this.tickers = {}
    this.disableParams = false
    this.params = {
      amount: false,
      recipient_address: false,
      recipient_avatar: false,
      message: false,
    }

    this.initializeParameters(this.selectedAsset, this.activatedRoute.snapshot.queryParams)

    if (this.selectedAsset === 'ETP') {
      this.recipients.push(new RecipientSendMore('', '', { ETP: undefined }, undefined))
    } else {
      this.recipients.push(new RecipientSendMore('', '', { MST: { [this.selectedAsset]: undefined } }, undefined))
    }

    // Load addresses and balances
    Promise.all([this.metaverseService.getBalances(), this.metaverseService.getAddresses(), this.metaverseService.getAddressBalances()])
      .then(([balances, addresses, addressbalancesObject]) => {
        const balance = (this.selectedAsset === 'ETP') ? balances.ETP : balances.MST[this.selectedAsset]
        this.balance = (balance && balance.available) ? balance.available : 0
        this.decimals = balance.decimals
        this.etpBalance = balances.ETP.available
        this.showBalance = this.balance
        this.addresses = addresses
        this.addressbalancesObject = addressbalancesObject

        const addrblncs = []
        Object.keys(addresses).forEach((index) => {
          const address = addresses[index]
          if (addressbalancesObject[address]) {
            addrblncs.push({
              address,
              avatar: addressbalancesObject[address].AVATAR ? addressbalancesObject[address].AVATAR : '',
              identifier: addressbalancesObject[address].AVATAR ? addressbalancesObject[address].AVATAR : address,
              balance: this.selectedAsset === 'ETP' ?
                addressbalancesObject[address].ETP.available :
                addressbalancesObject[address].MST[this.selectedAsset] ?
                  addressbalancesObject[address].MST[this.selectedAsset].available : 0
            })
          } else {
            addrblncs.push({ address, avatar: '', identifier: address, balance: 0 })
          }
        })
        this.addressbalances = addrblncs

        if (history.state.data && history.state.data.sender) {
          this.addressbalances.forEach((addressbalance) => {
            if (addressbalance.address === history.state.data.sender) {
              if (addressbalance.balance !== 0) {
                this.sendFrom = history.state.data.sender
                this.onFromAddressChange()
              }
            }
          })
        }
      })

    this.fee = this.appService.default_fees.default
    this.defaultFee = this.fee
    this.metaverseService.getFees()
      .then(fees => {
        this.fee = fees.default
        this.defaultFee = this.fee
      })


  }


  async ionViewDidEnter() {
    const addresses = await this.metaverseService.getAddresses()
    if (!Array.isArray(addresses) || !addresses.length) {
      this.router.navigate(['login'])
    } else {
      this.loadTickers()
    }
  }

  private async loadTickers() {
    [this.base, this.tickers] = await this.metaverseService.getBaseAndTickers()
  }

  onFromAddressChange() {
    if (this.sendFrom === 'auto') {
      this.showBalance = this.balance
    } else {
      if (this.addressbalances.length) {
        this.addressbalances.forEach((addressbalance) => {
          if (addressbalance.address === this.sendFrom) {
            this.showBalance = addressbalance.balance
          }
        })
      }
    }
  }

  validQuantity = (quantity) => quantity !== undefined
    && this.countDecimals(quantity) <= this.decimals
    && (quantity > 0)
    && ((this.selectedAsset === 'ETP' &&
      this.showBalance >= (Math.round(parseFloat(quantity) * Math.pow(10, this.decimals)) + this.fee)) ||
      (this.selectedAsset !== 'ETP' && this.showBalance >= parseFloat(quantity) * Math.pow(10, this.decimals)))

  fiatValue = (quantity: string) => (parseFloat(quantity) * this.tickers[this.selectedAsset][this.base].price) || 0

  countDecimals(value) {
    if (value && Math.floor(value) !== value && value.toString().split('.').length > 1) {
      return value.toString().split('.')[1].length || 0
    }
    return 0
  }

  cancel() {
    this.location.back()
  }

  create() {
    return this.alertService.showLoading()
      .then(() => {
        const messages = []
        if (this.message) {
          messages.push(this.message)
        }
        switch (this.transfer_type) {
          case 'one':
            if (this.lock) {
              return this.metaverseService.createAssetDepositTx(
                this.recipient_address,
                (this.recipient_avatar && this.recipient_avatar_valid) ? this.recipient_avatar : undefined,
                this.selectedAsset,
                Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals)),
                (this.showAdvanced && this.lock) ? this.attenuation_model : undefined,
                (this.sendFrom !== 'auto') ? this.sendFrom : null,
                (this.showAdvanced && this.changeAddress !== 'auto') ? this.changeAddress : undefined,
                (this.showAdvanced) ? this.fee : this.defaultFee,
                (this.showAdvanced && messages !== []) ? messages : undefined
              )
            } else {
              return this.metaverseService.createSendTx(
                this.selectedAsset,
                this.recipient_address,
                (this.recipient_avatar && this.recipient_avatar_valid) ? this.recipient_avatar : undefined,
                Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals)),
                (this.sendFrom !== 'auto') ? this.sendFrom : null,
                (this.showAdvanced && this.changeAddress !== 'auto') ? this.changeAddress : undefined,
                (this.showAdvanced) ? this.fee : this.defaultFee,
                ((this.showAdvanced || this.params.message) && messages !== []) ? messages : undefined
              )
            }
          case 'more':
            const target = {}
            const recipients = JSON.parse(JSON.stringify(this.recipients))
            target[this.selectedAsset] = Math.round(parseFloat(this.total_to_send[this.selectedAsset]) * Math.pow(10, this.decimals))
            recipients.forEach((recipient) => {
              if (this.selectedAsset === 'ETP') {
                recipient.target.ETP = Math.round(parseFloat(recipient.target.ETP) * Math.pow(10, this.decimals))
              } else {
                const convertedQuantity = Math.round(parseFloat(recipient.target.MST[this.selectedAsset]) * Math.pow(10, this.decimals))
                recipient.target.MST[this.selectedAsset] = convertedQuantity
                if (this.showAdvanced && this.lock && this.attenuation_model) {
                  recipient.attenuation_model = this.attenuation_model + ';LQ=' + convertedQuantity
                }
              }
            })
            return this.metaverseService.createSendMoreTx(
              target,
              recipients,
              (this.sendFrom !== 'auto') ? this.sendFrom : null,
              (this.showAdvanced && this.changeAddress !== 'auto') ? this.changeAddress : undefined,
              (this.showAdvanced && messages !== []) ? messages : undefined
            )
          default:
            this.alertService.stopLoading()
            this.alertService.showError('MESSAGE.UNKNOWN_TX_TYPE', '')
            return 0
        }
      })
      .catch((error) => {
        console.error(error.message)
        this.alertService.stopLoading()
        throw Error(error)
      })
  }

  async send() {
    if (this.validForm()) {
      try {
        const result = await this.create()
        const tx = result.encode().toString('hex')
        this.router.navigate(['account', 'confirm'], { state: { data: { tx } } })
        this.alertService.stopLoading()
      } catch (error) {
        console.error(error)
        this.alertService.stopLoading()
        switch (error.message) {
          case 'ERR_INSUFFICIENT_BALANCE':
            this.alertService.showError('SEND.MESSAGE.INSUFFICIENT_BALANCE', '')
            break
          case 'ERR_TOO_MANY_INPUTS':
            this.alertService.showErrorTranslated('SEND.MESSAGE.ERROR_TOO_MANY_INPUTS', 'SEND.MESSAGE.ERROR_TOO_MANY_INPUTS_TEXT')
            break
          default:
            this.alertService.showError('SEND.MESSAGE.CREATE_TRANSACTION', error.message)
            break
        }
      }
    }
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

  validAvatar = (input: string) => /[A-Za-z0-9.-]/.test(input) && this.recipient_avatar_valid

  validFromAddress = (address: string) =>
    address === 'auto' || (this.addressbalancesObject[address] && this.addressbalancesObject[address].ETP.available !== 0)

  validSendMoreAvatar = (input: string, index: number) => /[A-Za-z0-9.-]/.test(input) && this.sendMoreValidEachAvatar[index]

  validSendMoreTotalQuantity = () => (this.total+10000*this.recipients.length) <= this.showBalance
  validForm = () =>
    (this.transfer_type === 'one'
      && this.validaddress(this.recipient_address)
      && this.validQuantity(this.quantity)
      && this.validMessageLength(this.message)
      && (!this.lock || this.attenuation_model)
      && this.validFromAddress(this.sendFrom))
    || (this.transfer_type === 'more'
      && this.sendMoreValidQuantity
      && this.sendMoreValidAddress
      && this.validSendMoreTotalQuantity()
      && this.validMessageLength(this.message)
      && this.validFromAddress(this.sendFrom))

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
        })
        .catch((e) => {
          this.recipient_avatar_valid = false
          this.recipient_address = ''
        })
    }
  }

  sendMoreRecipientAvatarChanged = (index) => {
    if (this.recipients[index] && this.recipients[index].avatar) {
      this.recipients[index].avatar = this.recipients[index].avatar.trim()
    }
    Promise.all([this.metaverseService.getGlobalAvatar(this.recipients[index].avatar), this.recipients[index].avatar])
      .then(result => {
        if (this.recipients[index].avatar !== result[1]) {
          throw new Error('')
        }
        this.sendMoreValidEachAvatar[index] = true
        this.recipients[index].address = result[0].address
        this.checkSendMoreAddress()
      })
      .catch((e) => {
        this.sendMoreValidEachAvatar[index] = false
        this.recipients[index].address = ''
        this.sendMoreValidAddress = false
      })
  }

  quantityETPChanged = () => {
    let total = 0
    if (this.recipients) {
      this.recipients.forEach((recipient) => total = recipient.target.ETP ? total + parseFloat(recipient.target.ETP) : total)
    }
    this.total_to_send[this.selectedAsset] = +total.toFixed(this.decimals)
    this.total = this.total_to_send[this.selectedAsset] * Math.pow(10, this.decimals)
    this.checkEtpSendMoreQuantity()
  }

  quantityMSTChanged = () => {
    let total = 0
    if (this.recipients) {
      this.recipients.forEach((recipient) =>
        total = recipient.target.MST[this.selectedAsset] ? total + parseFloat(recipient.target.MST[this.selectedAsset]) : total)
    }
    this.total_to_send[this.selectedAsset] = +total.toFixed(this.decimals)
    this.total = this.total_to_send[this.selectedAsset] * Math.pow(10, this.decimals)
    this.checkMstSendMoreQuantity()
  }

  checkEtpSendMoreQuantity = () => {
    let valid = true
    this.recipients.forEach((recipient) => {
      if (
        !recipient.target ||
        !recipient.target.ETP ||
        recipient.target.ETP <= 0 ||
        this.countDecimals(recipient.target.ETP) > this.decimals
      ) {
        valid = false
      }
    })
    this.sendMoreValidQuantity = valid
  }

  checkMstSendMoreQuantity = () => {
    let valid = true
    this.recipients.forEach((recipient) => {
      if (
        !recipient.target ||
        !recipient.target.MST ||
        !recipient.target.MST[this.selectedAsset] ||
        recipient.target.MST[this.selectedAsset] <= 0 ||
        this.countDecimals(recipient.target.MST[this.selectedAsset]) > this.decimals
      ) {
        valid = false
      }
    })
    this.sendMoreValidQuantity = valid
  }

  checkSendMoreAddress = () => {
    let valid = true
    this.recipients.forEach((recipient) => {
      if (!recipient.address || !this.metaverseService.validAddress(recipient.address)) {
        valid = false
      }
    })
    this.sendMoreValidAddress = valid
  }

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
        if (deeplinkRegex.test(codeContent)) {
          const asset = codeContent.match(deeplinkRegex)[1]
          const paramsArray = codeContent.match(deeplinkRegex)[2].split('&')
          const params = {}
          paramsArray.forEach(param => {
            const split = param.split('=')
            params[split[0]] = split[1]
          })
          this.initializeParameters(asset, params)
        } else {
          const content = codeContent.toString().split('&')
          if (this.metaverseService.validAddress(content[0])) {
            this.recipient_address = content[0]
            this.recipientAddressInput.setFocus()
          } else {
            this.alertService.showMessage('SCAN.INVALID_ADDRESS.TITLE', 'SCAN.INVALID_ADDRESS.SUBTITLE', '')
          }
        }
      }
      modal.remove()
    })
    await modal.present()
  }

  addRecipient() {
    this.sendMoreValidQuantity = false
    this.sendMoreValidAddress = false
    if (this.selectedAsset === 'ETP') {
      this.recipients.push(new RecipientSendMore('', '', { ETP: undefined }, undefined))
    } else {
      this.recipients.push(new RecipientSendMore('', '', { MST: { [this.selectedAsset]: undefined } }, undefined))
    }
  }

  removeRecipient(index) {
    this.recipients.splice(index, 1)
    this.sendMoreValidEachAvatar.splice(index, 1)
    if (this.selectedAsset === 'ETP') {
      this.quantityETPChanged()
    } else {
      this.quantityMSTChanged()
    }
    this.checkSendMoreAddress()
  }

  sendMoreAddressChanged(index) {
    if (this.recipients[index] && this.recipients[index].address) {
      this.recipients[index].address = this.recipients[index].address.trim()
      this.recipients[index].avatar = ''
    }
    this.checkSendMoreAddress()
  }

  import(e) {
    this.alertService.showLoading()
      .then(() => {
        setTimeout(() => {
          this.open(e)
        }, 500)
      })
  }

  open(e) {
    const file = e.target.files
    const reader = new FileReader()
    const COLUMN_RECIPIENT_HEADER = 'recipient'
    const COLUMN_AMOUNT_HEADER = 'amount'
    const COLUMN_LOCK_BLOCK_HEADER = 'lock_blocks'
    const COLUMN_LOCK_MODEL_HEADER = 'lock_model'

    let errorLine = 0

    reader.onload = (info: any) => {
      const content = info.target.result
      try {
        const data = content.split('\n')
        this.recipients = []
        const columnIndex = {}
        data[0].split(',').forEach((columnName, index) => columnIndex[columnName] = index)
        for (let i = 1; i < this.sendMore_limit; i++) {
          if (data[i]) {
            const line = data[i].split(',')
            const recipient = line[columnIndex[COLUMN_RECIPIENT_HEADER]] ?
              line[columnIndex[COLUMN_RECIPIENT_HEADER]].trim() :
              line[columnIndex[COLUMN_RECIPIENT_HEADER]]
            const amount = line[columnIndex[COLUMN_AMOUNT_HEADER]] ?
              line[columnIndex[COLUMN_AMOUNT_HEADER]].trim() :
              line[columnIndex[COLUMN_AMOUNT_HEADER]]
            if (this.selectedAsset === 'ETP') {
              if (this.validaddress(recipient)) {
                this.recipients.push(new RecipientSendMore(recipient, '', { ETP: amount }, undefined))
              } else {
                this.recipients.push(new RecipientSendMore('', recipient, { ETP: amount }, undefined))
                this.sendMoreRecipientAvatarChanged(i - 1)
              }
            } else {
              let attenuationModel
              if (columnIndex[COLUMN_LOCK_BLOCK_HEADER] && line[columnIndex[COLUMN_LOCK_BLOCK_HEADER]]) {
                if (columnIndex[COLUMN_LOCK_MODEL_HEADER] && line[columnIndex[COLUMN_LOCK_MODEL_HEADER]]) {
                  errorLine = i + 1
                  throw Error('ERR_TWO_LOCK_MODEL')
                }
                const convertedQuantity = Math.round(parseFloat(amount) * Math.pow(10, this.decimals))
                const nbrBlocks = line[columnIndex[COLUMN_LOCK_BLOCK_HEADER]]
                attenuationModel = 'PN=0;LH=' + nbrBlocks + ';TYPE=1;LP=' + nbrBlocks + ';UN=1;LQ=' + convertedQuantity
              } else if (columnIndex[COLUMN_LOCK_MODEL_HEADER] && line[columnIndex[COLUMN_LOCK_MODEL_HEADER]]) {
                attenuationModel = line[columnIndex[COLUMN_LOCK_MODEL_HEADER]]
              }
              if (this.validaddress(recipient)) {
                this.recipients.push(new RecipientSendMore(recipient, '', { MST: { [this.selectedAsset]: amount } }, attenuationModel))
              } else {
                this.recipients.push(new RecipientSendMore('', recipient, { MST: { [this.selectedAsset]: amount } }, attenuationModel))
                this.sendMoreRecipientAvatarChanged(i - 1)
              }
            }
          }
        }
        if (data.length > this.sendMore_limit) {
          this.alertService.showLimitReached('MESSAGE.SEND_MORE_IMPORT_CSV_TOO_MANY_RECIPIENT_TITLE', 'MESSAGE.SEND_MORE_IMPORT_CSV_TOO_MANY_RECIPIENT_BODY', this.sendMore_limit)
        }
        if (this.selectedAsset === 'ETP') {
          this.quantityETPChanged()
        } else {
          this.quantityMSTChanged()
        }
        this.checkSendMoreAddress()
        this.alertService.stopLoading()
      } catch (error) {
        this.alertService.stopLoading()
        console.error(error.message)
        switch (error.message) {
          case 'ERR_TWO_LOCK_MODEL':
            this.alertService.showError('ERROR_TWO_LOCK_MODEL', errorLine)
            throw Error('ERR_IMPORT_CSV')
          default:
            this.alertService.showMessage('WRONG_FILE', '', 'SEND_MORE.WRONG_FILE')
            throw Error('ERR_IMPORT_CSV')
        }
      }
    }
    if (file[0]) {
      reader.readAsText(file[0])
    }
  }

  download() {
    let text = ''
    const filename = 'recipients.csv'
    let header = 'recipient' + ',' + 'amount'
    if (this.showAdvanced && this.lock && this.attenuation_model) {
      header += ',' + 'lock_blocks'
    }
    header += '\n'
    text += header
    this.recipients.forEach((recipient) => {
      let line = recipient.address + ','
      if (recipient.target.ETP) {
        line += recipient.target.ETP
      } else if (recipient.target.MST && recipient.target.MST[this.selectedAsset]) {
        line += recipient.target.MST[this.selectedAsset]
      }
      if (this.showAdvanced && this.lock && this.attenuation_model) {
        line += ',' + this.locktime
      }
      line += '\n'
      text += line
    })
    this.downloadFile(filename, text)
  }

  csvExample() {
    let text = 'recipient' + ',' + 'amount' + ',' + 'lock_blocks' + ',' + 'lock_model' + '\n'
    text += 'MAwLwVGwJyFsTBfNj2j5nCUrQXGVRvHzPh,2,10,\n'
    text += 'MEWdqvhETJex22kBbYDSD999Vs4xFwQ4fo,2,,PN=0;LH=20;TYPE=1;LP=20;UN=1;LQ=2\n'
    text += 'avatar-name,4'
    const filename = 'mvs_example.csv'
    this.downloadFile(filename, text)
  }

  downloadFile(filename, text) {
    const pom = document.createElement('a')
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    pom.setAttribute('download', filename)

    if (document.createEvent) {
      const event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      pom.dispatchEvent(event)
    }
    else {
      pom.click()
    }
  }

  setAttenuationModel = (output: any) => {
    this.attenuation_model = output.attenuation_model
    this.locktime = output.locktime
  }

  validaddress(address) {
    return this.metaverseService.validAddress(address)
  }

}
