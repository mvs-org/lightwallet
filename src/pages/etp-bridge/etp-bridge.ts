import { Component, ViewChild } from '@angular/core'
import { IonicPage, NavController, NavParams, Platform, ModalController } from 'ionic-angular'
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service'
import { AlertProvider } from '../../providers/alert/alert'
import { EtpBridgeServiceProvider, CreateOrderParameters, OrderDetails } from '../../providers/etp-bridge-service/etp-bridge-service'
import { AppGlobals } from '../../app/app.global';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@IonicPage()
@Component({
    selector: 'page-etp-bridge',
    templateUrl: 'etp-bridge.html',
})

export class EtpBridgePage {

    addresses: Array<string>
    etpBalance: number = 0
    addressbalances: Array<any>
    bridgeRate: any
    bridgePairs: any
    loadingPair: boolean = true
    depositSymbolList: Array<string> = []

    orders: OrderDetails[] = []
    importFromId: string

    createOrderParameters: CreateOrderParameters = {
        depositSymbol: "ETP",
        receiveSymbol: "BTC",
        receiveAmount: null,
        refundAddress: "",
        receiveAddress: "",
        depositAmount: null,
    }

    @ViewChild('quantityInput') quantityInput;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        private mvs: MvsServiceProvider,
        private etpBridgeService: EtpBridgeServiceProvider,
        private alert: AlertProvider,
        private globals: AppGlobals,
        private translate: TranslateService,
        private barcodeScanner: BarcodeScanner,
        public modalCtrl: ModalController,
    ) {

        this.getRate()
        this.loadOrders()

        etpBridgeService.getBridgePairs().toPromise()
            .then(pairs => {
                this.loadingPair = false;
                this.bridgePairs = pairs
                this.depositSymbolList = Object.keys(this.bridgePairs)
            })
            .catch((error) => {
                this.loadingPair = false;
                console.error(error)
            });

        //Load addresses and balances
        Promise.all([this.mvs.getBalances(), this.mvs.getAddresses(), this.mvs.getAddressBalances()])
            .then(([balances, addresses, addressbalances]) => {
                this.etpBalance = balances.ETP.available
                this.addresses = addresses

                let addrblncs = []
                Object.keys(addresses).forEach((index) => {
                    let address = addresses[index]
                    if (addressbalances[address]) {
                        addrblncs.push({ "address": address, "avatar": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : "", "identifier": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : address, "balance": addressbalances[address].ETP.available })
                    } else {
                        addrblncs.push({ "address": address, "avatar": "", "identifier": address, "balance": 0 })
                    }
                })
                this.addressbalances = addrblncs
            })
    }

    getRate() {
        this.bridgeRate = undefined
        this.etpBridgeService.getBridgeRate(this.createOrderParameters.depositSymbol, this.createOrderParameters.receiveSymbol).toPromise().then(rate => {
            this.bridgeRate = rate
            this.updateReceiveAmount()
        });
    }

    async loadOrders() {
        this.orders = await this.etpBridgeService.getOrders()
        return this.orders
    }

    createOrder() {
        var newOrder = undefined
        return this.alert.showLoading()
            .then(() => this.etpBridgeService.createOrder(this.createOrderParameters).toPromise())
            .then((order: OrderDetails) => {
                newOrder = order
                return this.etpBridgeService.saveOrder(order)
            })
            .then(() => this.loadOrders())
            .then(() => {
                this.alert.stopLoading()
                this.alert.showMessage('SUCCESS_CREATE_SWFT_TITLE', 'SUCCESS_CREATE_SWFT_BODY', '')
                this.gotoDetails(newOrder.id)
            })
            .catch((error) => {
                console.error(error)
                this.alert.stopLoading()
                this.alert.showError('MESSAGE.CREATE_SWFT_ORDER_ERROR', error._body)
            })
    }

    importOrder() {
        return this.alert.showLoading()
            .then(() => this.etpBridgeService.getOrder(this.importFromId).toPromise())
            .then((order: OrderDetails) => this.etpBridgeService.saveOrder(order))
            .then(() => this.loadOrders())
            .then(() => {
                this.alert.stopLoading()
                this.alert.showMessage('SUCCESS_IMPORT_SWFT_TITLE', 'SUCCESS_IMPORT_SWFT_BODY', '')
            })
            .catch((error) => {
                console.error(error)
                this.alert.stopLoading()
                this.alert.showError('MESSAGE.CREATE_SWFT_ORDER_ERROR', error.message)
            })
    }

    cancel(e) {
        e.preventDefault()
        this.createOrderParameters = {
            depositSymbol: "ETP",
            receiveSymbol: "BTC",
            receiveAmount: null,
            refundAddress: "",
            receiveAddress: "",
            depositAmount: null,
        }
    }

    changeDepositSymbol(newSymbol: string) {
        if (!this.etpBridgeService.isMetaverseSymbol(newSymbol) && !this.etpBridgeService.isMetaverseSymbol(this.createOrderParameters.receiveSymbol)) {
            this.createOrderParameters.receiveSymbol = "ETP"
        } else if (newSymbol === this.createOrderParameters.receiveSymbol) {
            this.createOrderParameters.receiveSymbol = this.createOrderParameters.depositSymbol
        }
        this.createOrderParameters.depositSymbol = newSymbol
        this.getRate()
    }

    changeReceiveSymbol(newSymbol: string) {
        if (!this.etpBridgeService.isMetaverseSymbol(newSymbol) && !this.etpBridgeService.isMetaverseSymbol(this.createOrderParameters.depositSymbol)) {
            this.createOrderParameters.depositSymbol = "ETP"
        } else if (newSymbol === this.createOrderParameters.depositSymbol) {
            this.createOrderParameters.depositSymbol = this.createOrderParameters.receiveSymbol
        }
        this.createOrderParameters.receiveSymbol = newSymbol
        this.getRate()
    }

    updateReceiveAmount() {
        let amount = this.bridgeRate ? this.createOrderParameters.depositAmount * this.bridgeRate.instantRate * (1 - this.bridgeRate.depositCoinFeeRate) : 0
        let stringAmount = amount.toString().split(".")
        stringAmount[1] = stringAmount[1] ? stringAmount[1].substring(0, 6) : '0'
        this.createOrderParameters.receiveAmount = parseFloat(stringAmount[0] + '.' + stringAmount[1])
    }

    switch() {
        let tempSymbol = this.createOrderParameters.receiveSymbol
        this.createOrderParameters.receiveSymbol = this.createOrderParameters.depositSymbol
        this.createOrderParameters.depositSymbol = tempSymbol

        this.createOrderParameters.receiveAmount = 0
        this.createOrderParameters.depositAmount = 0
        this.createOrderParameters.refundAddress = ""
        this.createOrderParameters.receiveAddress = ""

        this.getRate()
    }

    scan() {
        this.translate.get(['SCANNING.MESSAGE_ADDRESS']).subscribe((translations: any) => {
            this.barcodeScanner.scan(
                {
                    preferFrontCamera: false,
                    showFlipCameraButton: false,
                    showTorchButton: false,
                    torchOn: false,
                    prompt: translations['SCANNING.MESSAGE_ADDRESS'],
                    resultDisplayDuration: 0,
                    formats: "QR_CODE",
                }).then((result) => {
                    if (!result.cancelled) {
                        let content = result.text.toString().split('&')
                        if (this.mvs.validAddress(content[0]) == true) {
                            this.importFromId = content[0]
                        } else {
                            this.alert.showWrongAddress()
                        }
                    }
                })
        })
    }

    show(address) {
        let profileModal = this.modalCtrl.create('QRCodePage', { value: address });
        profileModal.present();
    }

    validDepositAmount = () => this.bridgeRate && this.createOrderParameters.depositAmount >= this.bridgeRate.depositMin && this.createOrderParameters.depositAmount <= this.bridgeRate.depositMax

    validAddress = (address, symbol) => {
        if (address === undefined || address == "") return false
        if (this.etpBridgeService.isMetaverseSymbol(symbol)) {
            return this.mvs.validAddress(address)
        }
        return true
    }

    validRefundAddress = () => this.validAddress(this.createOrderParameters.refundAddress, this.createOrderParameters.depositSymbol)

    validRecipientAddress = () => this.validAddress(this.createOrderParameters.receiveAddress, this.createOrderParameters.receiveSymbol)

    validId = () => this.importFromId

    explorerURL = (type, data) => (this.globals.network == 'mainnet') ? 'https://explorer.mvs.org/' + type + '/' + data : 'https://explorer-testnet.mvs.org/' + type + '/' + data

    gotoDetails = (id) => this.navCtrl.push("etp-bridge-details-page", { id: id })

}
