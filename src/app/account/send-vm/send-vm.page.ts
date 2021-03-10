import { Component, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { AppService } from 'src/app/services/app.service'
import { AlertService } from 'src/app/services/alert.service'
import { Location } from '@angular/common'
import { WalletService } from 'src/app/services/wallet.service'
import { Platform, ModalController } from '@ionic/angular'

import { VmService } from '../../services/vm.service'
import { ScanPage } from 'src/app/scan/scan.page'

@Component({
  selector: 'app-send-vm',
  templateUrl: './send-vm.page.html',
  styleUrls: ['./send-vm.page.scss'],
})

export class SendVmPage implements OnInit {

  selectedAsset = 'ETP'
  addresses: Array<string>
  balances: any = {}
  balance: number
  decimals: number
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

  isMobile: boolean

  @ViewChild('recipientAddressInput') recipientAddressInput
  @ViewChild('quantityInput') quantityInput
  swapAddress: string
  vmAddress: any = {}
  updateRequired = true
  requiredVersion: string

  recipient_address: string

  constructor(
    private metaverseService: MetaverseService,
    private walletService: WalletService,
    private appService: AppService,
    private router: Router,
    private alertService: AlertService,
    private location: Location,
    public platform: Platform,
    public vmService: VmService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {

  }

  async ionViewDidEnter() {
    this.init()
  }

  async init() {
    this.selectedAsset = 'ETP'
    this.quantity = ''
    this.sendFrom = 'auto'
    this.showAdvanced = false
    this.decimals = 18
    this.recipient_address = ''
    this.isMobile = this.walletService.isMobile()
    this.fee = this.appService.default_fees.sendVm
    this.defaultFee = this.fee

    const vmAddresses = await this.walletService.getVmAddresses()


    if (!vmAddresses || !vmAddresses.length || !vmAddresses[0]) {
      this.alertService.showMessage('SWAP.NO_VM_ADDRESS.TITLE', 'SWAP.NO_VM_ADDRESS.SUBTITLE', '')
      this.router.navigate(['account', 'identities', 'generate-vm-address'])
    } else if (await this.validAddress(vmAddresses[0].address) === false) {
      this.alertService.showMessage('SWAP.INVALID_VM_ADDRESS.TITLE', 'SWAP.INVALID_VM_ADDRESS.SUBTITLE', '')
      this.router.navigate(['account', 'portfolio'])
    } else {
      this.vmAddress = vmAddresses[0]
      this.vmAddress.balance = await this.vmService.balanceOf(this.vmAddress.address)
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
    && (this.vmAddress.balance >= (Math.round(parseFloat(quantity) * Math.pow(10, this.decimals)) + this.fee))


  countDecimals(value) {
    if (Math.floor(value) !== value && value.toString().split('.').length > 1) {
      return value.toString().split('.')[1].length || 0
    } else {
      return 0
    }
  }

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

  async sendAll() {
    const confirm = await this.alertService.alertConfirm(
      'SEND_SINGLE.ALL.TITLE',
      'SEND_SINGLE.ALL.SUBTITLE',
      'SEND_SINGLE.ALL.CANCEL',
      'SEND_SINGLE.ALL.OK'
    )
    if (confirm) {
      this.quantity = parseFloat((this.vmAddress.balance / Math.pow(10, this.decimals)).toFixed(this.decimals) + '') + ''
      this.quantityInput.setFocus()
    }
  }

  async send() {
    try {
      const params = this.vmService.sendParams(this.recipient_address, this.quantity)
      this.alertService.stopLoading()
      this.router.navigate(['account', 'confirm-vm'], { state: { data: { params } } })
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

  validForm = () => this.validQuantity(this.quantity) && this.validAddress(this.recipient_address)

  cancel() {
    this.location.back()
  }

  validAddress(address) {
    return this.walletService.validWeb3Address(address)
  }

  recipientChanged = () => {
    if (this.recipient_address) {
      this.recipient_address = this.recipient_address.trim()
    }
  }

}
