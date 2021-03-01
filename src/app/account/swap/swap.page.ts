import { Component, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { AppService } from 'src/app/services/app.service'
import { AlertService } from 'src/app/services/alert.service'
import { Location } from '@angular/common'
import { Platform } from '@ionic/angular'
import { WalletService } from 'src/app/services/wallet.service'

var compareVersions = require('compare-versions');

@Component({
  selector: 'app-swap',
  templateUrl: './swap.page.html',
  styleUrls: ['./swap.page.scss'],
})
export class SwapPage implements OnInit {

  selectedAsset = 'ETP'
  addresses: Array<string>
  balances: any = {}
  balance: number
  decimals: number
  showBalance: number
  quantity = ''
  addressbalances: Array<any>
  sendFrom = 'auto'
  changeAddress: string
  feeAddress = 'auto'

  message = ''
  fee: number
  defaultFee: number
  showAdvanced = false
  addressbalancesObject: any = {}
  etpBalance: number
  tickers = {}
  base: string

  @ViewChild('quantityInput') quantityInput
  swapAddress: string
  vmAddress: any
  swapInfo: any
  updateRequired = true
  requiredVersion: string

  constructor(
    private metaverseService: MetaverseService,
    private walletService: WalletService,
    private appService: AppService,
    private router: Router,
    private alertService: AlertService,
    private location: Location,
    public platform: Platform,
  ) { }

  ngOnInit() {

  }

  updateBalancePerAddress() {
    const addrblncs = []
    Object.keys(this.addresses).forEach((index) => {
      const address = this.addresses[index]
      if (this.addressbalancesObject[address]) {
        addrblncs.push({
          address,
          avatar: this.addressbalancesObject[address].AVATAR ? this.addressbalancesObject[address].AVATAR : '',
          identifier: this.addressbalancesObject[address].AVATAR ? this.addressbalancesObject[address].AVATAR : address,
          balance: this.selectedAsset === 'ETP' ? this.addressbalancesObject[address].ETP.available
            : this.addressbalancesObject[address].MST[this.selectedAsset]
              ? this.addressbalancesObject[address].MST[this.selectedAsset].available : 0
        })
      } else {
        addrblncs.push({ address, avatar: '', identifier: address, balance: 0 })
      }
    })
    this.addressbalances = addrblncs
    if (this.sendFrom !== 'auto'
      && (!this.addressbalancesObject[this.sendFrom][this.selectedAsset]
        || this.addressbalancesObject[this.sendFrom][this.selectedAsset].available < Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals)))) {
      this.sendFrom = 'auto'
    }
  }

  init() {
    this.selectedAsset = 'ETP'
    this.quantity = ''
    this.sendFrom = 'auto'
    this.feeAddress = 'auto'
    this.message = ''
    this.showAdvanced = false
    this.vmAddress = {}

    // Load addresses and balances
    Promise.all([this.metaverseService.getBalances(), this.metaverseService.getAddresses(), this.metaverseService.getAddressBalances()])
      .then(([balances, addresses, addressbalancesObject]) => {
        this.balances = balances.MST
        const balance = (this.selectedAsset === 'ETP') ? balances.ETP : balances.MST[this.selectedAsset]
        this.balance = (balance && balance.available) ? balance.available : 0
        this.etpBalance = balances.ETP.available
        this.showBalance = this.balance
        this.decimals = balance.decimals
        this.addresses = addresses
        this.addressbalancesObject = addressbalancesObject
        this.updateBalancePerAddress()
      })

    this.fee = this.appService.default_fees.default
    this.defaultFee = this.fee
    this.metaverseService.getFees()
      .then(fees => {
        this.fee = fees.default
        this.defaultFee = this.fee
      })
    this.swapAddress = (this.appService.network === 'testnet') ? this.appService.testnetMetaverseSwapAddress : this.appService.mainnetMetaverseSwapAddress
  }

  async ionViewDidEnter() {
    this.init()

    const addresses = await this.metaverseService.getAddresses()
    const vmAddresses = await this.walletService.getVmAddresses()
    if (!Array.isArray(addresses) || !addresses.length) {
      this.router.navigate(['login'])
    } else if (!vmAddresses || !vmAddresses.length || !vmAddresses[0]) {
      this.alertService.showMessage('SWAP.NO_VM_ADDRESS.TITLE', 'SWAP.NO_VM_ADDRESS.SUBTITLE', '')
      this.router.navigate(['account', 'identities', 'generate-vm-address'])
    } else if (await this.walletService.validWeb3Address(vmAddresses[0].address) === false) {
      this.alertService.showMessage('SWAP.INVALID_VM_ADDRESS.TITLE', 'SWAP.INVALID_VM_ADDRESS.SUBTITLE', '')
      this.router.navigate(['account', 'portfolio'])
    } else {
      this.vmAddress = vmAddresses[0]
      this.swapInfo = await this.metaverseService.getSwapInfo()
      this.requiredVersion = this.swapInfo.minVersion
      this.updateRequired = compareVersions(this.appService.version, this.requiredVersion) == -1
      this.loadTickers()
    }
  }

  private async loadTickers() {
    [this.base, this.tickers] = await this.metaverseService.getBaseAndTickers()
  }

  fiatValue = (quantity: string) => (parseFloat(quantity) * this.tickers[this.selectedAsset][this.base].price) || 0

  validQuantity = (quantity) => quantity !== undefined
    && this.countDecimals(quantity) <= this.decimals
    && (quantity > 0)
    && ((this.selectedAsset === 'ETP' &&
      this.showBalance >= (Math.round(parseFloat(quantity) * Math.pow(10, this.decimals)) + this.fee)) ||
      (this.selectedAsset !== 'ETP' && this.showBalance >= parseFloat(quantity) * Math.pow(10, this.decimals)))


  countDecimals(value) {
    if (Math.floor(value) !== value && value.toString().split('.').length > 1) {
      return value.toString().split('.')[1].length || 0
    } else {
      return 0
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

  async confirm() {
    const confirm = await this.alertService.alertConfirm(
      'BURN.CONFIRMATION.TITLE',
      'BURN.CONFIRMATION.SUBTITLE',
      'BURN.CONFIRMATION.CANCEL',
      'BURN.CONFIRMATION.OK'
    )
    if (confirm) {
      this.send()
    }
  }

  async create() {
    try {
      await this.alertService.showLoading()
      const messages = []
      messages.push(this.vmAddress.address)
      if (this.showAdvanced && this.message) {
        messages.push(this.message)
      }
      return this.metaverseService.createSendTx(
        this.selectedAsset,
        this.swapAddress,
        'Burn',
        Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals)),
        (this.sendFrom !== 'auto') ? this.sendFrom : null,
        (this.showAdvanced && this.changeAddress !== 'auto') ? this.changeAddress : undefined,
        (this.showAdvanced) ? this.fee : this.defaultFee,
        (messages !== []) ? messages : undefined
      )
    } catch (error) {
      console.error(error.message)
      this.alertService.stopLoading()
      throw Error(error)
    }
  }

  async send() {
    try {
      const messages = []
      if (this.message) {
        messages.push(this.message)
      }
      const result = await this.create()
      const tx = result.encode().toString('hex')
      this.alertService.stopLoading()
      this.router.navigate(['account', 'confirm'], { state: { data: { tx } } })
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

  validFromAddress = (address: string) =>
    address === 'auto' || (this.addressbalancesObject[address] && this.addressbalancesObject[address].ETP.available !== 0)

  validMessageLength = (message) => this.metaverseService.verifyMessageSize(message) < 253

  validForm = () =>
  (this.validQuantity(this.quantity)
    && this.validMessageLength(this.message)
    && this.validFromAddress(this.sendFrom))

  cancel() {
    this.location.back()
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

}
