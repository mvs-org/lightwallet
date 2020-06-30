import { Component, ViewChild, Input } from '@angular/core'
import { IonSelect, } from '@ionic/angular'
import { Router, ActivatedRoute } from '@angular/router'
import { AppService } from 'src/app/services/app.service'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { WalletService } from 'src/app/services/wallet.service'
import { AlertService } from 'src/app/services/alert.service'
import { Request, Message } from 'bitident'
import { Location } from '@angular/common'
import { BitidentService } from '../bitident.service'
import { isString } from 'lodash'

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.page.html',
  styleUrls: ['./confirm.page.scss'],
})
export class ConfirmPage {
  @Input() token: ''

  avatar = ''
  avatars: Array<string> = []
  avatarsAddress: any = {}
  verifiedToken: any
  sourceSignature: string
  hostname: string
  showDetails = false
  passphrase = ''
  noSigAgreed = false

  leftTime = 0

  @ViewChild('selectAvatar') selectAvatar: IonSelect

  constructor(
    private router: Router,
    private appService: AppService,
    private mvs: MetaverseService,
    private location: Location,
    private wallet: WalletService,
    private bitident: BitidentService,
    private alert: AlertService,
  ) {

  }

  ionViewDidEnter() {

    this.token = history.state.data ? history.state.data.token : ''

    this.loadAvatars()
      .then(() => this.check(this.token))
  }

  cancel() {
    this.router.navigate(['account', 'bitident'])
  }

  loadAvatars() {
    return this.mvs.listAvatars()
      .then((avatars) => {
        if (avatars.length === 0) {
          this.alert.showMessage('BITIDENT.MESSAGE.NO_AVATAR_TITLE', '', 'BITIDENT.MESSAGE.NO_AVATAR_TITLE_BODY')
        } else {
          return avatars.forEach(avatar => {
            this.avatarsAddress[avatar.symbol] = avatar.address
            this.avatars.push(avatar.symbol)
          })
        }
      })
  }

  validPassword = (passphrase) => passphrase && passphrase.length > 0

  async check(token) {

    if (this.token === undefined || !isString(this.token) || this.token.trim().length === 0) {
      this.location.back()
      return this.alert.showError('BITIDENT.MESSAGE.TOKEN_MISSING', '')
    }
    await this.alert.showLoading()
    try {


      const signedToken = Request.decode(token)

      this.sourceSignature = signedToken.sourceSignature

      if (signedToken.version > 1) {
        this.location.back()
        this.alert.showError('BITIDENT.MESSAGE.HIGHER_VERSION', 'version ' + signedToken.version)
      } else if (signedToken.network !== this.appService.network) {
        this.location.back()
        this.alert.showError('BITIDENT.MESSAGE.DIFFERENT_NETWORK', signedToken.network)
      } else if (signedToken.type != 'auth') {
        this.location.back()
        this.alert.showError('BITIDENT.MESSAGE.TYPE_NOT_SUPPORTED', signedToken.type)
      } else if ((signedToken.time + signedToken.timeout) * 1000 < Date.now()) {
        this.location.back()
        this.alert.showError('BITIDENT.MESSAGE.TIMEOUT', '')
      } else if (signedToken.target && this.avatars.indexOf(signedToken.target) === -1) {
        this.location.back()
        this.alert.showError('BITIDENT.MESSAGE.UNKNOWN_AVATAR', signedToken.target)
      } else {

        signedToken.sourceSignature = ''
        const encodedUnsignedToken = signedToken.encode('hex')

        const sourceAvatar = await this.mvs.getGlobalAvatar(signedToken.source)

        const sourceAddress = sourceAvatar.address

        if (this.sourceSignature && !Message.verify(encodedUnsignedToken, sourceAddress, Buffer.from(this.sourceSignature, 'hex'), signedToken.source)) {
          this.location.back()
          this.alert.showError('BITIDENT.MESSAGE.WRONG_SIGNATURE', signedToken.source)
        } else {
          this.hostname = new URL(signedToken.callback).hostname
          this.verifiedToken = signedToken
          this.leftTime = (signedToken.time + signedToken.timeout) - (Math.floor(Date.now()) / 1000)
          if (!this.verifiedToken.target) {
            setTimeout(() => this.selectAvatar.open(), 100)
          }
        }
      }
    } catch (e) {
      console.error(e)
      this.location.back()
      this.alert.showError('BITIDENT.MESSAGE.WRONG_INCOMING_DATA', e)
    }
    this.alert.stopLoading()

  }

  async signAndSend(passphrase) {

    try {
      await this.alert.showLoading()
      const wallet = await this.wallet.getWallet(passphrase)
      const node = await wallet.findDeriveNodeByAddess(this.avatarsAddress[this.verifiedToken.target], 200)
      const signature = await Message.signPK(
        this.verifiedToken.encode('hex'),
        node.keyPair.d.toBuffer(32),
        node.keyPair.compressed,
        this.verifiedToken.target
      )
      this.verifiedToken.targetSignature = signature.toString('hex')
      this.verifiedToken.sourceSignature = this.sourceSignature
      await this.bitident.confirm(this.verifiedToken.callback, this.verifiedToken.encode('hex'))
      this.alert.stopLoading()
      this.router.navigate(['account'])
      this.alert.showMessage('BITIDENT.MESSAGE.SIGNIN_SUCCESSFUL_TITLE', 'BITIDENT.MESSAGE.SIGNIN_SUCCESSFUL_BODY', '')
    } catch (error) {
      this.alert.stopLoading()
      if (error.message) { // internal error
        console.error(error.message)
        switch (error.message) {
          case 'ERR_DECRYPT_WALLET':
            this.alert.showError('BITIDENT.MESSAGE.PASSWORD_WRONG', '')
            break
          case 'EXPIRED':
            this.alert.showError('BITIDENT.MESSAGE.EXPIRED', '')
            break
          case 'ERR_AUTH':
            this.alert.showError('BITIDENT.MESSAGE.SEND_SIG_ERROR', '')
            break
          case 'ERR_INVALID_SIGNATURE':
            this.alert.showError('BITIDENT.MESSAGE.SEND_INVALID_SIGNATURE', '')
            break
          default:
            this.alert.showError('BITIDENT.MESSAGE.SIGN', error.message)
            throw Error('ERR_AUTH')
        }
      }
    }
  }

  onAvatarSelectChange = (avatar) => {
    this.verifiedToken.target = avatar
  }

}
