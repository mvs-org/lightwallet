import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { MetaverseService } from '../../../services/metaverse.service'
import { WalletService, Balance, Balances } from '../../../services/wallet.service'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { AlertService } from '../../../services/alert.service'
import { ConfigService } from 'src/app/services/config.service'
import { Dictionary } from 'lodash'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-send-single',
  templateUrl: './send-single.component.html',
  styleUrls: ['./send-single.component.scss'],
})
export class SendSingleComponent implements OnInit {

  symbol: string
  form: FormGroup
  balances: Balances
  addressBalances: Dictionary<Balances>
  addresses$: Observable<string[]>
  decimals: number
  loader: any

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    public metaverse: MetaverseService,
    private wallet: WalletService,
    private router: Router,
    private translate: TranslateService,
    private alertService: AlertService,
    private config: ConfigService,
  ) {

    this.form = this.formBuilder.group({
      recipientAddress: new FormControl('', [Validators.required, Validators.minLength(34), Validators.maxLength(34)]),
      amount: new FormControl('', [Validators.required]),
      passphrase: new FormControl('', [Validators.required, Validators.minLength(4)]),
      sendFrom: new FormControl('', []),
    })

    this.activatedRoute.parent.params.subscribe(params => {
      this.symbol = params.symbol
    })

    this.wallet.balances(this.metaverse)
      .then(balances$ => balances$.subscribe(balances => {
        this.balances = balances
        this.decimals = this.symbol === 'ETP' ? 8 : this.balances.MST[this.symbol].decimals
      }))
  }

  async ngOnInit() {
    this.loader = await this.alertService.loading('SEND_SINGLE.GENERATING_TX_TEXT')
    this.addresses$ = await this.wallet.addresses$()
    console.log(this.addresses$)
    this.wallet.addressBalances(this.metaverse)
      .then(addressBalanceStream => {
        addressBalanceStream
          .subscribe(addressBalances => {
            this.addressBalances = addressBalances
            console.log(this.addressBalances)
          })
      })
  }

  getError(control: FormControl, group?: FormGroup) {
    if (control.pristine) {
      return
    }
    if (control.errors) {
      return Object.entries(control.errors)[0]
    }
    if (group !== undefined && group.errors) {
      return Object.entries(group.errors)[0]
    }
    return
  }

  async create() {
    /*let messages = [];
    if (this.message) {
      messages.push(this.message)
    }*/
    /*if (this.lock) {
      return this.mvs.createAssetDepositTx(
        this.passphrase,
        this.recipient_address,
        (this.recipient_avatar && this.recipient_avatar_valid) ? this.recipient_avatar : undefined,
        this.selectedAsset,
        Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals)),
        this.attenuation_model,
        (this.sendFrom != 'auto') ? this.sendFrom : null,
        (this.showAdvanced && this.changeAddress != 'auto') ? this.changeAddress : undefined,
        (this.showAdvanced) ? this.fee : 10000,
        (this.showAdvanced && messages !== []) ? messages : undefined
      )
    } else {*/

    return this.metaverse.createSendTx(
      this.form.value.passphrase,
      this.symbol,
      this.form.value.recipientAddress,
      undefined, // (this.recipient_avatar && this.recipient_avatar_valid) ? this.recipient_avatar : undefined,
      Math.round(parseFloat(this.form.value.amount) * Math.pow(10, this.decimals)),
      (this.form.value.sendFrom !== 'auto') ? this.form.value.sendFrom : null,
      undefined, // (this.showAdvanced && this.changeAddress != 'auto') ? this.changeAddress : undefined,
      undefined, // (this.showAdvanced) ? this.fee : 10000,
      undefined, // (this.showAdvanced && messages !== []) ? messages : undefined,
      this.metaverse.network,
    )

  }

  async send() {
    try {
      this.loader = await this.alertService.loading('SEND_SINGLE.GENERATING_TX_TEXT')
      await this.loader.present()
      const tx = await this.create()
      this.loader.message = await this.translate.get('SEND_SINGLE.SENDING_TX_TEXT').toPromise()
      const result = await this.metaverse.send(tx)
      await this.loader.dismiss()
      return this.router.navigate(['/account'])
      // this.alert.showSent('SUCCESS_SEND_TEXT', result.hash)
    } catch (e) {
      console.error(e)
      await this.loader.dismiss()
      switch (e.message) {
        case 'ERR_CONNECTION':
          this.alertService.toast('TOAST.ERR_CONNECTION', this.config.longToastDuration, 'top', 'danger')
          break
        case 'ERR_DECRYPT_WALLET':
          this.alertService.toast('TOAST.WRONG_PASSWORD', this.config.longToastDuration, 'top', 'danger')
          break
        case 'ERR_INSUFFICIENT_BALANCE':
        case 'ERR_INSUFFICIENT_UTXO':
          this.alertService.toast('TOAST.ERR_INSUFFICIENT_BALANCE', this.config.longToastDuration, 'top', 'danger')
          break
        case 'ERR_TOO_MANY_INPUTS':
          this.alertService.toast('TOAST.ERR_TOO_MANY_INPUTS', this.config.longToastDuration, 'top', 'danger')
          break
        default:
          this.alertService.alert('SEND_SINGLE', 'UNKNOWN_ERROR', 'TITLE', e.message, ['OK'])
      }
    }
  }

}
