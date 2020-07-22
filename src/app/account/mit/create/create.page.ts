import { Component, OnInit } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { AlertService } from 'src/app/services/alert.service'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { Platform } from '@ionic/angular'

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {

  symbol = ''
  recipient_address = history.state.data && history.state.data.avatar_address ? history.state.data.avatar_address : ''
  recipient_avatar = history.state.data && history.state.data.avatar_name ? history.state.data.avatar_name : ''
  content = ''
  addressbalances: Array<any>
  avatars: Array<any>
  no_avatar = false
  no_avatar_placeholder: string
  defaultFee = 10000
  fee = 100000
  symbol_available = false
  showAdvanced = false

  constructor(
    private alertService: AlertService,
    public platform: Platform,
    private router: Router,
    private translate: TranslateService,
    private metaverseService: MetaverseService,
  ) {

    if (!this.recipient_address) {
      this.translate.get('CREATE_MIT.SELECT_AVATAR').subscribe((message: string) => {
        this.recipient_address = message
      })
    }
    this.translate.get('CREATE_MIT.NO_AVATAR_PLACEHOLDER').subscribe((message: string) => {
      this.no_avatar_placeholder = message
    })

    Promise.all([this.metaverseService.getAddressBalances(), this.metaverseService.listAvatars()])
      .then((results) => {
        console.log(results)
        this.avatars = results[1]
        if (this.avatars.length === 0) {
          this.no_avatar = true
        }
        const addressbalances = results[0]
        const addrblncs = []
        if (Object.keys(addressbalances).length) {
          Object.keys(addressbalances).forEach((address) => {
            if (addressbalances[address].ETP && addressbalances[address].ETP.available >= 10000) {
              addrblncs.push({ address, available: addressbalances[address].ETP.available })
              this.avatars.forEach((avatar) => {
                if (avatar.address === address) {
                  addrblncs.pop()
                }
              })
            }
          })
        }
        this.addressbalances = addrblncs
      })

    // this.fee = this.globals.default_fees.mitIssue
    this.defaultFee = this.fee
    this.metaverseService.getFees()
      .then(fees => {
        this.fee = fees.mitIssue
        this.defaultFee = this.fee
      })
  }

  ngOnInit() {
  }

  validSymbol = (symbol) => /^[A-Za-z0-9._\-]{3,64}$/g.test(symbol) && this.symbol_available

  validContent = (content) => content == undefined || content.length < 253

  validName = (recipient_avatar) => (recipient_avatar !== undefined && recipient_avatar.length > 0)

  validAddress = (recipient_address) => (recipient_address !== undefined && recipient_address.length > 0)

  create() {
    return this.alertService.showLoading()
      .then(() => this.metaverseService.createRegisterMITTx(
        this.recipient_address,
        this.recipient_avatar,
        this.symbol,
        this.content,
        undefined,
        (this.showAdvanced) ? this.fee : this.defaultFee)
      )
      .catch((error) => {
        console.error(error)
        this.alertService.stopLoading()
        switch (error.message) {
          case 'ERR_CONNECTION':
            this.alertService.showError('ERROR_SEND_TEXT', '')
            break
          case 'ERR_BROADCAST':
            this.translate.get('MESSAGE.ONE_TX_PER_BLOCK').subscribe((message: string) => {
              this.alertService.showError('MESSAGE.BROADCAST_ERROR', message)
            })
            break
          case 'ERR_INSUFFICIENT_BALANCE':
            this.alertService.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
            break
          default:
            this.alertService.showError('MESSAGE.CREATE_TRANSACTION', error.message)
        }
      })
  }

  send() {
    this.create()
      .then((result) => {
        // this.navCtrl.push('confirm-tx-page', { tx: result.encode().toString('hex') })
        const tx = result.encode().toString('hex')
        this.router.navigate(['account', 'confirm'], { state: { data: { tx } } })
        this.alertService.stopLoading()
      })
  }

  avatarChanged = () => {
    this.avatars.forEach((avatar) => {
      if (avatar.symbol === this.recipient_avatar) {
        this.recipient_address = avatar.address
        return
      }
    })
  }

  symbolChanged = () => {
    if (this.symbol && this.symbol.length >= 3) {
      this.symbol = this.symbol.trim()
      Promise.all([this.metaverseService.suggestMIT(this.symbol), this.symbol])
        .then(result => {
          if (this.symbol != result[1]) {
            throw ''
          } else if (result[0][0] === this.symbol) {
            this.symbol_available = false
          } else {
            this.symbol_available = true
          }
        })
        .catch((e) => {
          this.symbol_available = false
        })
    }
  }

}
