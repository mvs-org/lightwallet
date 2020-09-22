import { Component, OnInit, ViewChild } from '@angular/core'
import { OrderDetails, CreateOrderParameters, SwftService } from './swft.service'
import { Platform, ModalController } from '@ionic/angular'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { AlertService } from 'src/app/services/alert.service'
import { AppService } from 'src/app/services/app.service'
import { Router } from '@angular/router'
import { WalletService } from 'src/app/services/wallet.service'
import { ScanPage } from 'src/app/scan/scan.page'
import { QrComponent } from 'src/app/qr/qr.component'
import { ClipboardService } from 'ngx-clipboard'
import { ToastService } from 'src/app/services/toast.service'

@Component({
  selector: 'app-swft',
  templateUrl: './swft.page.html',
  styleUrls: ['./swft.page.scss'],
})
export class SwftPage implements OnInit {

  addresses: Array<string>
  etpBalance = 0
  addressbalances: Array<any>
  bridgeRate: any
  bridgePairs: any
  loadingPair = true
  loadingRate = false
  depositSymbolList: Array<string> = []

  orders: OrderDetails[] = []
  importFromId: string

  isMobile: boolean

  createOrderParameters: CreateOrderParameters = {
    depositSymbol: 'ETP',
    receiveSymbol: 'BTC',
    receiveAmount: null,
    refundAddress: '',
    receiveAddress: '',
    depositAmount: null,
  }

  @ViewChild('quantityInput') quantityInput

  constructor(
    public platform: Platform,
    private metaverseService: MetaverseService,
    public etpBridgeService: SwftService,
    private alertService: AlertService,
    private globals: AppService,
    public modalCtrl: ModalController,
    private router: Router,
    private walletService: WalletService,
    private clipboardService: ClipboardService,
    private toastService: ToastService,
  ) {

    this.isMobile = this.walletService.isMobile()

    this.etpBridgeService.getBridgePairs().toPromise()
      .then(pairs => {
        this.loadingPair = false
        this.bridgePairs = pairs
        this.depositSymbolList = Object.keys(this.bridgePairs)
      })
      .catch((error) => {
        this.loadingPair = false
        console.error(error)
      })

    // Load addresses and balances
    Promise.all([this.metaverseService.getBalances(), this.metaverseService.getAddresses(), this.metaverseService.getAddressBalances()])
      .then(([balances, addresses, addressbalances]) => {
        this.etpBalance = balances.ETP.available
        this.addresses = addresses

        const addrblncs = []
        Object.keys(addresses).forEach((index) => {
          const address = addresses[index]
          if (addressbalances[address]) {
            addrblncs.push({
              address,
              avatar: addressbalances[address].AVATAR ? addressbalances[address].AVATAR : '',
              identifier: addressbalances[address].AVATAR ? addressbalances[address].AVATAR : address,
              balance: addressbalances[address].ETP.available,
            })
          } else {
            addrblncs.push({
              address,
              avatar: '',
              identifier: address,
              balance: 0,
            })
          }
        })
        this.addressbalances = addrblncs
      })
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.getRate()
    this.loadOrders()
  }

  getRate() {
    this.loadingRate = true
    this.bridgeRate = undefined
    this.etpBridgeService.getBridgeRate(this.createOrderParameters.depositSymbol, this.createOrderParameters.receiveSymbol).toPromise()
      .then(rate => {
        this.bridgeRate = rate
        this.updateReceiveAmount()
      })
      .finally(() => {
        this.loadingRate = false
      })
  }

  async loadOrders() {
    this.orders = await this.etpBridgeService.getOrders()
    return this.orders
  }

  createOrder() {
    let newOrder
    return this.alertService.showLoading()
      .then(() => this.etpBridgeService.createOrder(this.createOrderParameters).toPromise())
      .then((order: OrderDetails) => {
        newOrder = order
        return this.etpBridgeService.saveOrder(order)
      })
      .then(() => this.loadOrders())
      .then(() => {
        this.alertService.stopLoading()
        this.alertService.showMessage('SWFT.MESSAGE.SUCCESS_CREATE_SWFT_TITLE', 'SWFT.MESSAGE.SUCCESS_CREATE_SWFT_BODY', '')
        this.gotoDetails(newOrder.id)
      })
      .catch((error) => {
        console.error(error)
        this.alertService.stopLoading()
        this.alertService.showError('SWFT.MESSAGE.CREATE_SWFT_ORDER_ERROR', error._body)
      })
  }

  importOrder() {
    return this.alertService.showLoading()
      .then(() => this.etpBridgeService.getOrder(this.importFromId).toPromise())
      .then((order: OrderDetails) => this.etpBridgeService.saveOrder(order))
      .then(() => this.loadOrders())
      .then(() => {
        this.alertService.stopLoading()
        this.alertService.showMessage('SWFT.MESSAGE.SUCCESS_IMPORT_SWFT_TITLE', 'SWFT.MESSAGE.SUCCESS_IMPORT_SWFT_BODY', '')
      })
      .catch((error) => {
        console.error(error)
        this.alertService.stopLoading()
        this.alertService.showError('SWFT.MESSAGE.CREATE_SWFT_ORDER_ERROR', error.message)
      })
  }

  cancel() {
    this.createOrderParameters = {
      depositSymbol: 'ETP',
      receiveSymbol: 'BTC',
      receiveAmount: null,
      refundAddress: '',
      receiveAddress: '',
      depositAmount: null,
    }
  }

  changeDepositSymbol(newSymbol: string) {
    if (!this.etpBridgeService.isMetaverseSymbol(newSymbol)
      && !this.etpBridgeService.isMetaverseSymbol(this.createOrderParameters.receiveSymbol)) {
      this.createOrderParameters.receiveSymbol = 'ETP'
    } else if (newSymbol === this.createOrderParameters.receiveSymbol) {
      this.createOrderParameters.receiveSymbol = this.createOrderParameters.depositSymbol
    }
    this.createOrderParameters.depositSymbol = newSymbol
    this.getRate()
  }

  changeReceiveSymbol(newSymbol: string) {
    if (!this.etpBridgeService.isMetaverseSymbol(newSymbol)
      && !this.etpBridgeService.isMetaverseSymbol(this.createOrderParameters.depositSymbol)) {
      this.createOrderParameters.depositSymbol = 'ETP'
    } else if (newSymbol === this.createOrderParameters.depositSymbol) {
      this.createOrderParameters.depositSymbol = this.createOrderParameters.receiveSymbol
    }
    this.createOrderParameters.receiveSymbol = newSymbol
    this.getRate()
  }

  updateReceiveAmount() {
    const amount = this.bridgeRate ?
      this.createOrderParameters.depositAmount * this.bridgeRate.instantRate * (1 - this.bridgeRate.depositCoinFeeRate) : 0
    const stringAmount = amount.toString().split('.')
    stringAmount[1] = stringAmount[1] ? stringAmount[1].substring(0, 6) : '0'
    this.createOrderParameters.receiveAmount = parseFloat(stringAmount[0] + '.' + stringAmount[1])
  }

  switch() {
    const tempSymbol = this.createOrderParameters.receiveSymbol
    this.createOrderParameters.receiveSymbol = this.createOrderParameters.depositSymbol
    this.createOrderParameters.depositSymbol = tempSymbol

    this.createOrderParameters.receiveAmount = 0
    this.createOrderParameters.depositAmount = 0
    this.createOrderParameters.refundAddress = ''
    this.createOrderParameters.receiveAddress = ''

    this.getRate()
  }


  async copy(textToCopy, type) {
    try {
      await this.clipboardService.copyFromContent(textToCopy)
      switch (type) {
        case 'id':
          this.toastService.simpleToast('SWFT.TOAST.ID_COPIED')
          break
        default:
          this.toastService.simpleToast('IDENTITIES.TOAST.COPIED')
      }
    } catch (error) {
      console.log('Error while copying')
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
        const content = result.data.text.toString().split('&')
        if (this.metaverseService.validAddress(content[0])) {
          this.importFromId = content[0]
        } else {
          this.alertService.showMessage('SCAN.INVALID_ADDRESS.TITLE', 'SCAN.INVALID_ADDRESS.SUBTITLE', '')
        }
      }
      modal.remove()
    })
    await modal.present()
  }

  async show(address) {
    const content = address
    const title = address

    const qrcodeModal = await this.modalCtrl.create({
        component: QrComponent,
        componentProps: {
            title,
            content,
        }
    })
    await qrcodeModal.present()
}

  validDepositAmount = (amount) =>
    this.bridgeRate && amount >= this.bridgeRate.depositMin && amount <= this.bridgeRate.depositMax

  validAddress = (address, symbol) => {
    if (address === undefined || address === '') { return false }
    if (this.etpBridgeService.isMetaverseSymbol(symbol)) {
      return this.metaverseService.validAddress(address)
    }
    return true
  }

  validRefundAddress = () => this.validAddress(this.createOrderParameters.refundAddress, this.createOrderParameters.depositSymbol)

  validRecipientAddress = () => this.validAddress(this.createOrderParameters.receiveAddress, this.createOrderParameters.receiveSymbol)

  validId = (id) => id

  explorerURL = (type, data) => (this.globals.network === 'mainnet') ? 'https://explorer.mvs.org/' + type + '/' + data : 'https://explorer-testnet.mvs.org/' + type + '/' + data

  gotoDetails = (id) => this.router.navigate(['account', 'swft', 'order', id])


}
