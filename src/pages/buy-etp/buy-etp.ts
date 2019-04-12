import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage()
@Component({
  selector: 'page-buy-etp',
  templateUrl: 'buy-etp.html',
})

export class BuyEtpPage {

  transfer_type: string = "buy"
  addresses: Array<string>
  addressbalances: Array<any>
  sendFrom: string = "auto"
  changeAddress: string
  feeAddress: string = "auto"
  passphrase: string = ""
  etpBalance: number
  rawtx: string
  selectedAsset: string = "ETP"
  decimals: number = 8
  fee: number = 10000
  quantity: string = ""
  message: string = ""
  @ViewChild('quantityInput') quantityInput;

  constructor(
      public navCtrl: NavController, 
      public navParams: NavParams,
      public platform: Platform,
      private mvs: MvsServiceProvider,
      private alert: AlertProvider,
      private wallet: WalletServiceProvider,
    ) {

      wallet.getSwftRate("BTC", "ETH");

      //Load addresses and balances
      Promise.all([this.mvs.getBalances(), this.mvs.getAddresses(), this.mvs.getAddressBalances()])
      .then(([balances, addresses, addressbalances]) => {
          this.etpBalance = balances.ETP.available
          this.addresses = addresses

          let addrblncs = []
          Object.keys(addresses).forEach((index) => {
              let address = addresses[index]
              if (addressbalances[address]) {
                  addrblncs.push({ "address": address, "avatar": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : "", "identifier": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : address, "balance": addressbalances[address].ETP.available})
              } else {
                  addrblncs.push({ "address": address, "avatar": "", "identifier": address, "balance": 0 })
              }
          })
          this.addressbalances = addrblncs
      })
  }

  sell() {
    this.create()
        .then(tx => this.mvs.send(tx))
        .then((result) => {
            this.navCtrl.pop()
            this.alert.stopLoading()
            this.alert.showSent('SUCCESS_SEND_TEXT', result.hash)
        })
        .catch((error) => {
            console.error(error)
            this.alert.stopLoading()
            switch(error.message){
                case "ERR_CONNECTION":
                    this.alert.showError('ERROR_SEND_TEXT', '')
                    break;
                case "ERR_CREATE_TX":
                    //already handle in create function
                    break;
                default:
                    this.alert.showError('MESSAGE.BROADCAST_ERROR', error.message)
            }
        })
  }

  cancel(e) {
    e.preventDefault()
    this.navCtrl.pop()
  }

  preview() {
      this.create()
          .then((tx) => {
              this.rawtx = tx.encode().toString('hex')
              this.alert.stopLoading()
          })
          .catch((error) => {
              this.alert.stopLoading()
          })
  }

  create() {
      return this.alert.showLoading()
          .then(() => {
              let messages = [];
              if(this.message) {
                  messages.push(this.message)
              }
              return this.mvs.createSendTx(
                this.passphrase,
                this.selectedAsset,
                this.recipient_address,
                undefined,
                Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals)),
                (this.sendFrom != 'auto') ? this.sendFrom : null,
                (this.changeAddress != 'auto') ? this.changeAddress : undefined,
                this.fee,
                (messages !== []) ? messages : undefined
            )
          })
          .catch((error) => {
              console.error(error.message)
              switch(error.message){
                  case "ERR_DECRYPT_WALLET":
                      this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                      throw Error('ERR_CREATE_TX')
                  case "ERR_INSUFFICIENT_BALANCE":
                      this.alert.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
                      throw Error('ERR_CREATE_TX')
                  case "ERR_TOO_MANY_INPUTS":
                      this.alert.showErrorTranslated('ERROR_TOO_MANY_INPUTS', 'ERROR_TOO_MANY_INPUTS_TEXT')
                      throw Error('ERR_CREATE_TX')
                  default:
                      this.alert.showError('MESSAGE.CREATE_TRANSACTION', error.message)
                      throw Error('ERR_CREATE_TX')
              }
          })
  }

  sendAll = () => this.alert.showSendAll(() => {
    this.quantity = parseFloat(((this.etpBalance / 100000000 - this.fee / 100000000).toFixed(8)) + "") + ""
    this.quantityInput.setFocus()
  })

  validMessageLength = (message) => this.mvs.verifyMessageSize(message) < 253

}
