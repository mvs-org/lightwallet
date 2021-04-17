import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { AppService } from 'src/app/services/app.service'
import { AlertService } from 'src/app/services/alert.service'
import { Location } from '@angular/common'
import { Platform } from '@ionic/angular'

@Component({
  selector: 'app-burn',
  templateUrl: './burn.page.html',
  styleUrls: ['./burn.page.scss'],
})
export class BurnPage implements OnInit {

  selectedAsset: string
  assetsList: Array<string>
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

  constructor(
    private metaverseService: MetaverseService,
    private appService: AppService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private location: Location,
    public platform: Platform,
  ) { }

  ngOnInit() {
    this.selectedAsset = this.activatedRoute.snapshot.params.symbol || 'ETP'

    // Load addresses and balances
    Promise.all([this.metaverseService.getBalances(), this.metaverseService.getAddresses(), this.metaverseService.getAddressBalances()])
      .then(([balances, addresses, addressbalancesObject]) => {
        this.balances = balances.MST
        const balance = (this.selectedAsset === 'ETP') ? balances.ETP : balances.MST[this.selectedAsset]
        this.balance = (balance && balance.available) ? balance.available : 0
        this.etpBalance = balances.ETP.available
        this.showBalance = this.balance
        this.decimals = balance.decimals
        this.assetsList = Object.keys(this.balances)
        this.assetsList.sort((a, b) =>
          a.localeCompare(b)
        )
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

  create() {
    return this.alertService.showLoading()
      .then(() => {
        const messages = []
        if (this.message) {
          messages.push(this.message)
        }
        return this.metaverseService.burn(
          this.selectedAsset,
          Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals)),
          (this.sendFrom !== 'auto') ? this.sendFrom : null,
          (this.showAdvanced && this.changeAddress !== 'auto') ? this.changeAddress : undefined,
          (this.showAdvanced) ? this.fee : this.defaultFee,
          (this.showAdvanced && messages !== []) ? messages : undefined
        )
      })
      .catch((error) => {
        console.error(error.message)
        this.alertService.stopLoading()
        throw Error(error)
      })
  }

  async send() {
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

  validFromAddress = (address: string) =>
    address === 'auto' || (this.addressbalancesObject[address] && this.addressbalancesObject[address].ETP.available !== 0)

  validMessageLength = (message) => this.metaverseService.verifyMessageSize(message) < 253

  onSelectedAssetChange(event) {
    this.decimals = this.balances[this.selectedAsset].decimals
    this.updateBalancePerAddress()
  }

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
