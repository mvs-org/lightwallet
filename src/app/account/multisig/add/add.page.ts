import { Component, ViewChild } from '@angular/core'
import { MetaverseService } from '../../../services/metaverse.service'
import { Platform, ModalController } from '@ionic/angular'
import { AlertService } from '../../../services/alert.service'
import { WalletService } from '../../../services/wallet.service'
import { Router } from '@angular/router'
import { ScanPage } from 'src/app/scan/scan.page'

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage {

  creation_type = 'new'
  addressbalances: Array<any>
  addresses: Array<string>
  passphrase = ''
  address = ''
  myPublicKey = ''
  cosignersLimit = 20

  cosigners: Array<string> = []
  nbrSigReq: number
  nbrSigReqOptions: Array<number> = [1, 2]
  import_address = ''
  @ViewChild('importAddressInput') importAddressInput
  passphrase_import = ''
  validPublicKeys = false
  isMobile: boolean

  customTrackBy(index: number, obj: any): any {
    return index
  }

  constructor(
    private metaverseService: MetaverseService,
    public platform: Platform,
    private alertService: AlertService,
    private router: Router,
    private walletService: WalletService,
    private modalCtrl: ModalController,
  ) {

    this.cosigners.push('')

    this.isMobile = this.walletService.isMobile()

    // Load addresses and balances
    Promise.all([this.metaverseService.getAddresses(), this.metaverseService.getAddressBalances()])
      .then((balances) => {
        const addresses = balances[0]
        const addressbalances = balances[1]
        const addrblncs = []
        Object.keys(addresses).forEach((index) => {
          const address = addresses[index]
          if (addressbalances[address]) {
            addrblncs.push({
              address,
              avatar: addressbalances[address].AVATAR ? addressbalances[address].AVATAR : '',
              identifier: addressbalances[address].AVATAR ? addressbalances[address].AVATAR : address,
              balance: addressbalances[address].ETP.available
            })
          } else {
            addrblncs.push({
              address,
              avatar: '',
              identifier: address,
              balance: 0
            })
          }
        })
        this.addressbalances = addrblncs
      })

  }

  cancel() {
    this.router.navigate(['account', 'multisig'])
  }

  onAddressChange(event) {
    this.myPublicKey = ''
  }

  getPublicKey(address) {
    this.alertService.showLoading()
      .then(() => this.walletService.getWallet(this.passphrase))
      .then(wallet => this.walletService.getPublicKeyByAddress(wallet, address))
      .then(publicKey => {
        this.alertService.stopLoading()
        this.myPublicKey = publicKey
      })
      .catch(error => {
        console.error(error)
        this.alertService.stopLoading()
        switch (error.message) {
          case 'ERR_DECRYPT_WALLET':
            this.alertService.showError('MESSAGE.PASSWORD_WRONG', '')
            break
          default:
            this.alertService.showError('MULTISIG.MESSAGE.ERROR_GET_PUBLIC_KEY', error.message)
            break
        }
      })
  }

  getAddress(cosigners, nbrSigReq, myPublicKey, passphrase) {
    if (!this.myPublicKey) {
      this.alertService.showError('MULTISIG.MESSAGE.ERROR_MISSING_MY_PUBLIC_KEY', '')
    } else if (!this.validPublicKeys) {
      this.alertService.showError('MULTISIG.MESSAGE.ERROR_MULTISIG_WRONG_PUBLIC_KEYS', '')
    } else {
      try {
        this.alertService.showLoading()
          .then(() => {
            const nbrSigns = parseInt(nbrSigReq, 10)
            const publicKeys = cosigners.concat(myPublicKey)
            const multisig = this.walletService.getNewMultisigAddress(nbrSigns, publicKeys)
            const newMultisig = {
              d: '',
              k: publicKeys,
              m: nbrSigns,
              n: publicKeys.length,
              s: myPublicKey,
              a: multisig.address,
              r: multisig.script
            }
            this.addMultisigAddress(newMultisig, true, passphrase)
          })
      } catch (e) {
        console.error(e)
        this.alertService.stopLoading()
        this.alertService.showError('MULTISIG.ADD.ERROR', e.message)
      }
    }
  }

  importAddress(address, passphrase) {
    this.alertService.showLoading()
      .then(() => {
        try {
          this.metaverseService.getMultisigWallet(address.trim())
            .then((newMultisig) => {
              if (!newMultisig) {
                this.alertService.stopLoading()
                this.alertService.showError('MULTISIG.MESSAGE.ERROR_IMPORT_ADDRESS_UNKNOW', '')
              } else {
                Promise.all([this.metaverseService.getAddresses(), this.walletService.getWallet(passphrase)])
                  .then((result) => {
                    const addresses = result[0]
                    const wallet = result[1]
                    let myPublicKey
                    Promise.all(newMultisig.k.map((publicKey) => {
                      this.walletService.findDeriveNodeByPublic(wallet, publicKey, addresses ? addresses.length : undefined)
                        .then(myMultisigWallet => {
                          // console.log("Found it!")
                          myPublicKey = publicKey
                        })
                        .catch(error => {
                          this.alertService.stopLoading()
                          switch (error.message) {
                            case 'ERR_NO_HDNODE_FOR_PUBLICKEY':
                              // not user's public key
                              break
                            default:
                              console.error(error)
                              break
                          }
                        })
                    }))
                      .then(() => {
                        if (myPublicKey) {
                          newMultisig.s = myPublicKey
                          const multisig = this.walletService.getNewMultisigAddress(newMultisig.m, newMultisig.k)
                          newMultisig.r = multisig.r
                          this.addMultisigAddress(newMultisig, false, passphrase)
                        } else {
                          this.alertService.stopLoading()
                          this.alertService.showError('MULTISIG.MESSAGE.ERROR_ADDRESS_NOT_THIS_WALLET', '')
                        }
                      })
                  })
                  .catch(error => {
                    console.error(error)
                    this.alertService.stopLoading()
                    switch (error.message) {
                      case 'ERR_DECRYPT_WALLET':
                        this.alertService.showError('MULTISIG.MESSAGE.ERROR_WRONG_PASSWORD', '')
                        break
                      default:
                        this.alertService.showError('MULTISIG.MESSAGE.ERROR_GET_PUBLIC_KEY', error.message)
                        break
                    }
                  })
              }
            })
        } catch (e) {
          console.error(e)
          this.alertService.stopLoading()
          this.alertService.showError('IMPORT_ADDRESS.ERROR', e.message)
        }
      })
  }

  addMultisigAddress(newMultisig, newAddress: boolean, passphrase) {
    this.walletService.getMultisigAddresses()
      .then((multisigAddresses) => {
        if (multisigAddresses.indexOf(newMultisig.a) !== -1) {
          this.alertService.stopLoading()
          this.alertService.showError('MULTISIG.ADD.ADDRESS_ALREADY_EXISTS', newMultisig.a)
        } else {
          try {
            if (newAddress) {
              this.metaverseService.addMultisigWallet(newMultisig)
            }
          } catch (error) {
            console.error(error)
          }
          this.walletService.addMultisig(newMultisig)
            .then(() => this.walletService.saveSessionAccount(passphrase))
            .then(() => this.alertService.stopLoading())
            .then(() => this.alertService.showMessage(newAddress ? 'MULTISIG.MESSAGE.SUCCESS_CREATE_MULTISIG' : 'MULTISIG.MESSAGE.SUCCESS_IMPORT_MULTISIG', '', newMultisig.a))
            .then(() => this.router.navigate(['/loading'], { state: { data: { reset: true } } }))
            .catch(error => {
              console.error(error)
              this.alertService.stopLoading()
              this.alertService.showError('MULTISIG.ADD.ERROR', error.message)
            })
        }
      })
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
          this.import_address = content[0]
          this.importAddressInput.setFocus();
        } else {
          this.alertService.showMessage('SCAN.INVALID_ADDRESS.TITLE', 'SCAN.INVALID_ADDRESS.SUBTITLE', '')
        }
      }
      modal.remove()
    })
    await modal.present()
  }

  addCosigner() {
    this.cosigners.push('')
    this.nbrSigReqOptions.push(this.nbrSigReqOptions.length + 1)
    this.checkPublicKeys()
  }

  removeCosigner(index) {
    this.cosigners.splice(index, 1)
    this.nbrSigReqOptions.pop()
    this.checkPublicKeys()
  }

  validPassword = (password) => (password) ? password.length > 0 : false;

  validAddress = this.metaverseService.validAddress

  validPublicKey = (publicKey, i) => (publicKey) ? publicKey.length == 66 && this.validNotMyKey(publicKey) && this.validUsedOnceKey(publicKey, i) : false;

  validNotMyKey = (publicKey) => publicKey !== this.myPublicKey

  validUsedOnceKey = (publicKey, i) => this.cosigners.indexOf(publicKey) === i

  validnbrSigReq = (nbrSigReq) => nbrSigReq && nbrSigReq > 0

  checkPublicKeys = () => {
    let valid = true
    this.cosigners.forEach((key, i) => {
      if (!key || !this.validPublicKey(key, i))
        valid = false
    })
    this.validPublicKeys = valid
  }

}
