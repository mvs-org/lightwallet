import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';

@IonicPage({
    name: 'confirm-tx-page',
    segment: 'confirm'
})
@Component({
    selector: 'page-confirm-tx',
    templateUrl: 'confirm-tx.html',
})

export class ConfirmTxPage {

    hexTx: any = this.navParams.get('tx')
    decodedTx: any
    displayedTx: any
    passphrase: string = ''
    input: string
    signedTx: string
    mode: string = 'default'
    status: string
    allMyInputs: boolean = true
    addresses: Array<string> = []
    multisig: any = {}

    constructor(
        public navCtrl: NavController,
        private mvs: MvsServiceProvider,
        private alert: AlertProvider,
        public navParams: NavParams,
        private wallet: WalletServiceProvider,
    ) { }

    async ionViewDidEnter() {
        if (this.navParams.get('tx') === undefined) {
            this.navCtrl.setRoot('AccountPage')
        } else {
            this.decodeAndOrganize(this.hexTx)
        }

        const addresses = await this.mvs.getAddresses()
        const multisigAddresses = await this.wallet.getMultisigAddresses()
        this.addresses = addresses.concat(multisigAddresses)
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    async preview() {
        await this.alert.showLoading()
        try {
            let tx = await this.sign()
            this.signedTx = await tx.encode().toString('hex')
            this.hexTx = this.signedTx
            this.decodeAndOrganize(this.signedTx)
            this.alert.stopLoading()
        } catch (error) {
            this.alert.stopLoading()
            console.error(error.message)
        }
    }

    async decodeAndOrganize(tx) {
        //decodedTx is the tx to sign and send
        this.decodedTx = await this.mvs.decodeTx(tx)

        //displayedTx contains more information usefull for the display
        this.displayedTx = await this.mvs.organizeTx(JSON.parse(JSON.stringify(this.decodedTx)))

        this.checkTxSignStatus(this.displayedTx)
    }

    send() {
        this.sign()
            .then(tx => this.broadcast(tx))
            .catch((error) => {})
    }

    broadcast(tx) {
        this.alert.showLoading()
            .then(() => this.mvs.send(tx))
            .then((result) => {
                this.alert.stopLoading()
                this.alert.showSent('SUCCESS_SEND_TEXT', result.hash)
                this.navCtrl.setRoot('AccountPage')
            })
            .catch((error) => {
                this.alert.stopLoading()
                console.error(error.message)
                switch (error.message) {
                    case 'ERR_CONNECTION':
                        this.alert.showError('ERROR_SEND_TEXT', '')
                        break;
                    case 'ERR_SIGN_TX':
                        //already handle in create function
                        break;
                    default:
                        this.alert.showError('MESSAGE.BROADCAST_TRANSACTION', error.message)
                        throw Error('ERR_BROADCAST_TX')
                }
            })
    }

    sign() {
        if (this.multisig.status == 'MULTISIG') {
            return this.wallet.signMultisigTx(this.decodedTx.inputs[0].address, this.decodedTx, this.passphrase)
                .catch((error) => {
                    console.error(error.message)
                    switch (error.message) {
                        case 'ERR_DECRYPT_WALLET':
                            this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                            throw Error('ERR_SIGN_TX')
                        case 'ERR_DECRYPT_WALLET_FROM_SEED':
                            this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                            throw Error('ERR_SIGN_TX')
                        case 'ERR_INSUFFICIENT_BALANCE':
                            this.alert.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
                            throw Error('ERR_SIGN_TX')
                        case 'ERR_TOO_MANY_INPUTS':
                            this.alert.showErrorTranslated('ERROR_TOO_MANY_INPUTS', 'ERROR_TOO_MANY_INPUTS_TEXT')
                            throw Error('ERR_SIGN_TX')
                        case 'SIGN_ALREADY_INCL':
                            this.alert.showError('MESSAGE.ALREADY_SIGN_TRANSACTION', '')
                            throw Error('ERR_SIGN_TX')
                        default:
                            this.alert.showError('MESSAGE.SIGN_TRANSACTION', error.message)
                            throw Error('ERR_SIGN_TX')
                    }
                })
        } else {
            return this.mvs.sign(this.decodedTx, this.passphrase, this.allMyInputs)
                .catch((error) => {
                    console.error(error.message)
                    switch (error.message) {
                        case 'ERR_DECRYPT_WALLET':
                            this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                            throw Error('ERR_SIGN_TX')
                        case 'ERR_DECRYPT_WALLET_FROM_SEED':
                            this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                            throw Error('ERR_SIGN_TX')
                        case 'ERR_INSUFFICIENT_BALANCE':
                            this.alert.showError('MESSAGE.INSUFFICIENT_BALANCE', '')
                            throw Error('ERR_SIGN_TX')
                        case 'ERR_TOO_MANY_INPUTS':
                            this.alert.showErrorTranslated('ERROR_TOO_MANY_INPUTS', 'ERROR_TOO_MANY_INPUTS_TEXT')
                            throw Error('ERR_SIGN_TX')
                        default:
                            this.alert.showError('MESSAGE.SIGN_TRANSACTION', error.message)
                            throw Error('ERR_SIGN_TX')
                    }
                })
        }
    }

    async checkTxSignStatus(tx) {
        let foundSignedInput = false
        let foundUnisgnedInput = false

        let foundNotMultisigInput = false
        let foundMultisigInput = false
        let multisigAddress = ''
        let differentMultisigAddressesInput = false

        for (let i = 0; i < tx.inputs.length; i++) {
            let input = tx.inputs[i]

            if (input.address[0] == '3') {
                foundMultisigInput = true
                this.multisig.current_nbr_sign = input.script.split("[").length - 2
                this.multisig.info = await this.getMultisigInfo(input.address)
                let signatureStatus = await this.mvs.getSignatureStatus(this.decodedTx, i, this.multisig.info.r, this.multisig.info.s)
                this.multisig.selfSigned = signatureStatus.targetSigned
                if (!signatureStatus.complete) {
                    foundUnisgnedInput = true
                } else {
                    foundSignedInput = true
                }

                if (multisigAddress && multisigAddress !== input.address) {
                    differentMultisigAddressesInput = true
                } else {
                    multisigAddress = input.address
                }

            } else {
                foundNotMultisigInput = true
                if (input.script) {
                    foundSignedInput = true
                } else {
                    foundUnisgnedInput = true
                }
            }

            if (this.addresses.indexOf(input.previous_output.address) == -1) {
                this.allMyInputs = false
            }
        }

        if (foundSignedInput && !foundUnisgnedInput) {
            this.status = 'SIGNED'
        } else if (!foundSignedInput && foundUnisgnedInput) {
            this.status = 'UNSIGNED'
        } else {
            this.status = 'PARTIALLY'
        }

        if (differentMultisigAddressesInput) {
            //contains multiples multisig addresses as inputs (not supported)
            this.multisig.status = 'MIX_MULTISIG'
        } else if (foundMultisigInput && !foundNotMultisigInput) {
            this.multisig.status = 'MULTISIG'

        } else if (!foundMultisigInput && foundNotMultisigInput) {
            this.multisig.status = 'NOT_MULTISIG'
        } else {
            //contains multisig and normal address as input (not supported)
            this.multisig.status = 'PARTIALLY_MULTISIG'
        }

    }

    async getMultisigInfo(address) {
        let multisigs = await this.wallet.getMultisigsInfo()
        let multisig_info = {}
        multisigs.forEach(multisig => {
            if (multisig.a == address) {
                multisig_info = multisig
            }
        })
        return multisig_info
    }

    validPassword = (passphrase) => (passphrase.length > 0)

}
