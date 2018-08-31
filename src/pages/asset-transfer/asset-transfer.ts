import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AlertProvider } from '../../providers/alert/alert';
import { Keyboard } from '@ionic-native/keyboard';

class RecipientSendMore {
    constructor(
        public address: string,
        public target: any
    ) { }
}

@IonicPage({
    name: 'transfer-page',
    segment: 'send/:asset'
})
@Component({
    selector: 'page-asset-transfer',
    templateUrl: 'asset-transfer.html',
})
export class AssetTransferPage {

    selectedAsset: any
    addresses: Array<string>
    balance: number
    decimals: number
    showBalance: number
    recipient_address: string = ""
    recipient_avatar: string
    recipient_avatar_valid: boolean
    quantity: string = ""
    builtFor: string
    rawtx: string
    passcodeSet: any
    addressbalances: Array<any>
    sendFrom: string = "auto"
    changeAddress: string
    feeAddress: string = "auto"
    passphrase: string = ""
    etpBalance: number
    @ViewChild('recipientAddressInput') recipientAddressInput;
    @ViewChild('quantityInput') quantityInput;
    transfer_type: string = "one"
    recipients: Array<RecipientSendMore> = []
    total_to_send: any = {}
    sendMoreValidQuantity: boolean = false
    sendMoreValidAddress: boolean = false
    sendMore_limit: number = 1000
    total: number
    message: string = ""
    fee: number = 10000

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private alert: AlertProvider,
        private barcodeScanner: BarcodeScanner,
        private keyboard: Keyboard,
        private translate: TranslateService
    ) {

        this.selectedAsset = navParams.get('asset')
        if(this.selectedAsset == 'ETP') {
            this.recipients.push(new RecipientSendMore('', {"ETP": undefined}))
        } else {
            this.recipients.push(new RecipientSendMore('', {"MST": { [this.selectedAsset]: undefined}}))
        }
        this.total_to_send[this.selectedAsset] = 0
        this.total = 0


        //Load addresses
        mvs.getAddresses()
            .then((_: Array<string>) => {
                this.addresses = _
            })

        //Load balances
        mvs.getBalances()
            .then((balances) => {
                let balance = (this.selectedAsset == 'ETP') ? balances.ETP : balances.MST[this.selectedAsset]
                this.balance = (balance && balance.available) ? balance.available : 0
                this.decimals = balance.decimals
                this.etpBalance = balances.ETP.available
                this.showBalance = this.balance
                return this.mvs.getAddressBalances()
                    .then((addressbalances) => {
                        let addrblncs = []
                        if (Object.keys(addressbalances).length) {
                            Object.keys(addressbalances).forEach((address) => {
                                if (this.selectedAsset == 'ETP') {
                                    if (addressbalances[address].ETP.available > 0) {
                                        addrblncs.push({ "address": address, "avatar": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : "", "identifier": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : address, "balance": addressbalances[address].ETP.available })
                                    }
                                } else {
                                    if (addressbalances[address].MST[this.selectedAsset] && addressbalances[address].MST[this.selectedAsset].available) {
                                        addrblncs.push({ "address": address, "avatar": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : "", "identifier": addressbalances[address].AVATAR ? addressbalances[address].AVATAR : address, "balance": addressbalances[address].MST[this.selectedAsset].available })
                                    }
                                }
                            })
                        }
                        this.addressbalances = addrblncs
                    })
            })
    }

    ionViewDidEnter() {
        this.mvs.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
            })
    }

    onFromAddressChange(event) {
        if (this.sendFrom == 'auto') {
            this.showBalance = this.balance
        } else {
            if (this.addressbalances.length)
                this.addressbalances.forEach((addressbalance) => {
                    if (addressbalance.address == this.sendFrom)
                        this.showBalance = addressbalance.balance
                })
        }
    }

    validQuantity = (quantity) => quantity != undefined
        && this.countDecimals(quantity) <= this.decimals
        && ((this.selectedAsset == 'ETP' && this.showBalance >= (Math.round(parseFloat(quantity) * Math.pow(10, this.decimals)) + this.fee)) || (this.selectedAsset != 'ETP' && this.showBalance >= parseFloat(quantity) * Math.pow(10, this.decimals)))
        && (quantity > 0)

    countDecimals(value) {
        if (Math.floor(value) !== value && value.toString().split(".").length > 1)
            return value.toString().split(".")[1].length || 0;
        return 0;
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
            .then(() => this.mvs.getAddresses())
            .then((addresses) => {
                let messages = [];
                if(this.message) {
                    messages.push(this.message)
                }
                switch(this.transfer_type){
                    case "one":
                        return this.mvs.createSendTx(
                            this.passphrase,
                            this.selectedAsset,
                            this.recipient_address,
                            (this.recipient_avatar && this.recipient_avatar_valid) ? this.recipient_avatar : undefined,
                            Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals)),
                            (this.sendFrom != 'auto') ? this.sendFrom : null,
                            (this.changeAddress != 'auto') ? this.changeAddress : undefined,
                            this.fee,
                            (messages !== []) ? messages : undefined
                        )
                    case "more":
                        let target = {}
                        let recipients = JSON.parse(JSON.stringify(this.recipients))
                        target[this.selectedAsset] = Math.round(parseFloat(this.total_to_send[this.selectedAsset]) * Math.pow(10, this.decimals))
                        if(this.selectedAsset == 'ETP') {
                            recipients.forEach((recipient) => recipient.target['ETP'] = Math.round(parseFloat(recipient.target['ETP']) * Math.pow(10, this.decimals)))
                        } else {
                            recipients.forEach((recipient) => recipient.target['MST'][this.selectedAsset] = Math.round(parseFloat(recipient.target['MST'][this.selectedAsset]) * Math.pow(10, this.decimals)))
                        }
                        return this.mvs.createSendMoreTx(
                            this.passphrase,
                            target,
                            recipients,
                            (this.sendFrom != 'auto') ? this.sendFrom : null,
                            (this.changeAddress != 'auto') ? this.changeAddress : undefined,
                            (messages !== []) ? messages : undefined
                        )
                    default:
                        this.alert.showError('MESSAGE.UNKNOWN_TX_TYPE', '')
                        return 0
                }
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

    send() {
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

    sendAll = () => this.alert.showSendAll(() => {
        if (this.selectedAsset == 'ETP') {
            this.quantity = parseFloat(((this.showBalance / 100000000 - this.fee / 100000000).toFixed(this.decimals)) + "") + ""
        } else {
            this.quantity = parseFloat((this.showBalance / Math.pow(10, this.decimals)).toFixed(this.decimals) + "") + ""
        }
        this.quantityInput.setFocus()
    })

    validrecipient = this.mvs.validAddress

    validAvatar = (input: string) => /[A-Za-z0-9.-]/.test(input) && this.recipient_avatar_valid

    recipientChanged = () => {
        if (this.recipient_address) {
            this.recipient_address = this.recipient_address.trim()
        }
    }

    recipientAvatarChanged = () => {
        if (this.recipient_avatar) {
            this.recipient_avatar = this.recipient_avatar.trim()
            Promise.all([this.mvs.getGlobalAvatar(this.recipient_avatar), this.recipient_avatar])
                .then(result => {
                    if (this.recipient_avatar != result[1])
                        throw ''
                    this.recipient_avatar_valid = true
                    this.recipient_address = result[0].address
                    this.recipientChanged()
                })
                .catch((e) => {
                    this.recipient_avatar_valid = false
                    this.recipient_address = ""
                    this.recipientChanged()
                })
        }
    }

    quantityETPChanged = () => {
        let total = 0
        if(this.recipients) {
            this.recipients.forEach((recipient) => total = recipient.target['ETP'] ? total + parseFloat(recipient.target['ETP']) : total)
        }
        this.total_to_send[this.selectedAsset] = +total.toFixed(this.decimals);
        this.total = this.total_to_send[this.selectedAsset] * Math.pow(10, this.decimals);
        this.checkEtpSendMoreQuantity()
    }

    quantityMSTChanged = () => {
        let total = 0
        if(this.recipients) {
            this.recipients.forEach((recipient) => total = recipient.target['MST'][this.selectedAsset] ? total + parseFloat(recipient.target['MST'][this.selectedAsset]) : total)
        }
        this.total_to_send[this.selectedAsset] = +total.toFixed(this.decimals);
        this.total = this.total_to_send[this.selectedAsset] * Math.pow(10, this.decimals);
        this.checkMstSendMoreQuantity()
    }

    checkEtpSendMoreQuantity = () => {
        let valid = true
        this.recipients.forEach((recipient) => {
            if(!recipient.target || !recipient.target['ETP'] || recipient.target['ETP'] <= 0 || this.countDecimals(recipient.target['ETP']) > this.decimals)
                valid = false
        })
        this.sendMoreValidQuantity = valid
    }

    checkMstSendMoreQuantity = () => {
        let valid = true
        this.recipients.forEach((recipient) => {
            if(!recipient.target || !recipient.target['MST'] || !recipient.target['MST'][this.selectedAsset] || recipient.target['MST'][this.selectedAsset] <= 0 || this.countDecimals(recipient.target['MST'][this.selectedAsset]) > this.decimals)
                valid = false
        })
        this.sendMoreValidQuantity = valid
    }

    checkSendMoreAddress = () => {
        let valid = true
        this.recipients.forEach((recipient) => {
            if(!recipient.address || !this.mvs.validAddress(recipient.address))
                valid = false
        })
        this.sendMoreValidAddress = valid
    }

    validPassword = (passphrase) => (passphrase.length > 0)

    validMessageLength = (message) => this.mvs.verifyMessageSize(message) < 253

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
                            this.recipient_address = content[0]
                            this.recipientAddressInput.setFocus();
                            this.keyboard.close()
                        } else {
                            this.alert.showWrongAddress()
                        }
                    }
                })
        })
    }

    addRecipient() {
        this.sendMoreValidQuantity = false
        this.sendMoreValidAddress = false
        if(this.selectedAsset == 'ETP') {
            this.recipients.push(new RecipientSendMore('', {"ETP": undefined}))
        } else {
            this.recipients.push(new RecipientSendMore('', {"MST": { [this.selectedAsset]: undefined}}))
        }
    }

    removeRecipient(index) {
        this.recipients.splice(index, 1)
        if(this.selectedAsset == 'ETP'){
            this.quantityETPChanged()
        } else {
            this.quantityMSTChanged()
        }
        this.checkSendMoreAddress()
    }

    sendMoreRecipientChanged(index) {
        if (this.recipients[index] && this.recipients[index].address) {
            this.recipients[index].address = this.recipients[index].address.trim()
        }
        this.checkSendMoreAddress()
    }

    import(e) {
        this.alert.showLoading()
            .then(() => {
                setTimeout(() => {
                    this.open(e)
                }, 500);
            })
    }

    open(e) {
        let file = e.target.files
        let reader = new FileReader();
        reader.onload = (e: any) => {
            let content = e.target.result;
            try {
                let data = content.split('\n');
                this.recipients = []
                for(let i=0;i<this.sendMore_limit;i++){
                    if(data[i]) {
                        let recipient = data[i].split(',');
                        if(this.selectedAsset == 'ETP') {
                            this.recipients.push(new RecipientSendMore(recipient[0] ? recipient[0].trim() : recipient[0], {"ETP": recipient[1] ? recipient[1].trim() : recipient[1]}))
                        } else {
                            this.recipients.push(new RecipientSendMore(recipient[0] ? recipient[0].trim() : recipient[0], {"MST": { [this.selectedAsset]: recipient[1] ? recipient[1].trim() : recipient[1]}}))
                        }
                    }
                }
                if(data.length > this.sendMore_limit)
                    this.alert.showTooManyRecipients(this.sendMore_limit)
                if(this.selectedAsset == 'ETP'){
                    this.quantityETPChanged()
                } else {
                    this.quantityMSTChanged()
                }
                this.checkSendMoreAddress()
                this.alert.stopLoading()
            } catch (e) {
                this.alert.stopLoading()
                console.error(e);
                this.alert.showMessage('WRONG_FILE', '', 'SEND_MORE.WRONG_FILE')
            }
        };
        if(file[0])
            reader.readAsText(file[0]);
    }

    download() {
        var text = ''
        var filename = 'recipients.csv'
        this.recipients.forEach((recipient) => {
            let line = recipient.address + ','
            if(recipient.target['ETP']) {
                line += recipient.target['ETP']
            } else if (recipient.target['MST'] && recipient.target['MST'][this.selectedAsset]) {
                line += recipient.target['MST'][this.selectedAsset]
            }
            line += '\n'
            text += line
        })
        this.downloadFile(filename, text)
    }

    csvExample() {
        var text = 'MAwLwVGwJyFsTBfNj2j5nCUrQXGVRvHzPh,2\nMEWdqvhETJex22kBbYDSD999Vs4xFwQ4fo,2';
        var filename = 'mvs_example.csv'
        this.downloadFile(filename, text)
    }

    downloadFile(filename, text) {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);

        if (document.createEvent) {
            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            pom.dispatchEvent(event);
        }
        else {
            pom.click();
        }
    }

}
