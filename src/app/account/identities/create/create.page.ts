import { Component, OnInit } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { Router, ActivatedRoute } from '@angular/router'
import { Platform } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { AlertService } from 'src/app/services/alert.service'

class AddressBalance {
  constructor(
    public address: string,
    public available: number
  ) { }
}

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})


export class CreatePage implements OnInit {

  symbol = ''
  avatar_address = ''
  addressbalances: Array<AddressBalance> = []
  bounty_fee: number
  default_bounty_fee: number
  total_fee: number
  addressSelectOptions: any
  message = ''
  available_symbol = false
  showAdvanced = false

  constructor(
    private alertService: AlertService,
    private router: Router,
    public metaverseService: MetaverseService,
    public platform: Platform,
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
  ) {

    this.avatar_address = this.activatedRoute.snapshot.params.address

    console.log(this.avatar_address)

    Promise.all([this.metaverseService.getAddresses(), this.metaverseService.getAddressBalances()])
      .then(([addresses, addressbalances]) => {
        addresses.forEach((address) => {
          if (addressbalances[address] && addressbalances[address].ETP && addressbalances[address].ETP.available >= 100000000 && addressbalances[address].AVATAR === '') {
            this.addressbalances.push(new AddressBalance(address, addressbalances[address].ETP.available))
          }
        })
      })

    this.bounty_fee = 80      // this.globals.default_fees.bountyShare
    this.default_bounty_fee = this.bounty_fee
    this.total_fee = 100000000      // this.globals.default_fees.avatar
    this.metaverseService.getFees()
      .then(fees => {
        this.bounty_fee = fees.bountyShare
        this.default_bounty_fee = this.bounty_fee
        this.total_fee = fees.avatar
      })
  }

  ngOnInit() {
    this.translate.get('CREATE_AVATAR.ADDRESS_SUBTITLE').subscribe((message: string) => {
      this.addressSelectOptions = {
        subHeader: message
      }
    })
  }

  create() {
    return this.alertService.showLoading()
      .then(() => {
        const messages = []
        if (this.message) {
          messages.push(this.message)
        }
        return this.metaverseService.createAvatarTx(
          this.avatar_address,
          this.symbol,
          undefined,
          (this.showAdvanced) ? this.bounty_fee * this.total_fee / 100 : this.default_bounty_fee * this.total_fee / 100,
          messages
        )
      })
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
          case 'ERR_DECRYPT_WALLET':
            this.alertService.showError('MESSAGE.PASSWORD_WRONG', '')
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
        const tx = result.encode().toString('hex')
        this.router.navigate(['account', 'confirm'], { state: { data: { tx } } })
        this.alertService.stopLoading()
      })
  }

  async confirm() {
    const confirm = await this.alertService.alertConfirm(
      'CREATE_AVATAR.CONFIRMATION.TITLE',
      'CREATE_AVATAR.CONFIRMATION.SUBTITLE',
      'CREATE_AVATAR.CONFIRMATION.CANCEL',
      'CREATE_AVATAR.CONFIRMATION.OK'
    )
    if (confirm) {
      this.send()
    }
  }

  validAddress = (avatar_address) => (avatar_address != '')

  validSymbol = (symbol) => (symbol.length > 2) && (symbol.length < 64) && (!/[^A-Za-z0-9@_.-]/g.test(symbol)) && this.available_symbol

  validMessageLength = (message) => this.metaverseService.verifyMessageSize(message) < 253

  symbolChanged = (symbol) => {
    symbol = symbol.trim()
    this.symbol = symbol
    if (symbol && symbol.length >= 3) {
      this.metaverseService.getAvatarAvailable(symbol)
        .then(available => {
          if (this.symbol != symbol) {
            return
          } else {
            this.available_symbol = available
          }
        })
        .catch((e) => {
          this.available_symbol = false
        })
    }
  }

}
