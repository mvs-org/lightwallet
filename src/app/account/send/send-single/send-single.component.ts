import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { MetaverseService } from '../../../services/metaverse.service'
import { WalletService, Balances } from '../../../services/wallet.service'
import { Router } from '@angular/router'
import { LoadingController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-send-single',
  templateUrl: './send-single.component.html',
  styleUrls: ['./send-single.component.scss'],
})
export class SendSingleComponent implements OnInit {

  symbol: string
  form: FormGroup
  balances: Balances
  decimals: number
  loaderCreateTx: any
  loaderSendTx: any

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    public metaverse: MetaverseService,
    private wallet: WalletService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private translate: TranslateService,
  ) {

    this.form = this.formBuilder.group({
      recipientAddress: new FormControl('', [Validators.required, Validators.minLength(34), Validators.maxLength(34)]),
      amount: new FormControl('', [Validators.required]),
      passphrase: new FormControl('', [Validators.required, Validators.minLength(4)]),
    })

    this.activatedRoute.parent.params.subscribe(params => {
      this.symbol = params.symbol
    })

    this.wallet.balances(this.metaverse)
    .subscribe(balances => {
      this.balances = balances
      this.decimals = this.symbol === 'ETP' ? 8 : this.balances.MST[this.symbol].decimals
    })

  }

  async ngOnInit() {

    this.loaderCreateTx = await this.loadingCtrl.create({
      animated: true,
      spinner: 'crescent',
      message: await this.translate.get('SEND_SINGLE.GENERATING_TX_TEXT').toPromise(),
    })

    this.loaderSendTx = await this.loadingCtrl.create({
      animated: true,
      spinner: 'crescent',
      message: await this.translate.get('SEND_SINGLE.SENDING_TX_TEXT').toPromise(),
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

  create() {
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
      null, //(this.sendFrom != 'auto') ? this.sendFrom : null,
      undefined, //(this.showAdvanced && this.changeAddress != 'auto') ? this.changeAddress : undefined,
      undefined, //(this.showAdvanced) ? this.fee : 10000,
      undefined, // (this.showAdvanced && messages !== []) ? messages : undefined,
      'testnet',  //this.network
    )
      .catch((error) => {
        console.error(error.message)
        switch (error.message) {
          case 'ERR_DECRYPT_WALLET':
            //this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
            throw Error('ERR_CREATE_TX')
          case 'ERR_INSUFFICIENT_BALANCE':
            //this.alert.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
            throw Error('ERR_CREATE_TX')
          case 'ERR_TOO_MANY_INPUTS':
            //this.alert.showErrorTranslated('ERROR_TOO_MANY_INPUTS', 'ERROR_TOO_MANY_INPUTS_TEXT')
            throw Error('ERR_CREATE_TX')
          default:
            //this.alert.showError('MESSAGE.CREATE_TRANSACTION', error.message)
            throw Error('ERR_CREATE_TX')
        }
      })
  }

  async send() {
    try {
      await this.loaderCreateTx.present()
      const tx = await this.create()
      await this.loaderSendTx.present()
      await this.loaderCreateTx.dismiss()
      const result = await this.metaverse.send(tx, this.balances)
      await this.loaderSendTx.dismiss()
      return this.router.navigate(['/account'])
      //this.alert.showSent('SUCCESS_SEND_TEXT', result.hash)
    } catch (e) {
      console.error(e)
      //this.alert.stopLoading()
      switch (e.message) {
        case 'ERR_CONNECTION':
          //this.alert.showError('ERROR_SEND_TEXT', '')
          break;
        case 'ERR_CREATE_TX':
          //already handle in create function
          break;
        default:
        //this.alert.showError('MESSAGE.BROADCAST_ERROR', error.message)
      }
    }
  }

}
