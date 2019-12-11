import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';

@IonicPage({
    name: 'vote-page',
    segment: 'vote'
})
@Component({
    selector: 'page-vote',
    templateUrl: 'vote.html',
})
export class VotePage {

    selectedAsset = 'DNA'
    addresses: Array<string>
    balance: number
    decimals: number
    showBalance: number
    candidate: string
    quantity: string = ""
    addressbalances: Array<any>
    sendFrom: string = "auto"
    changeAddress: string
    feeAddress: string = "auto"
    etpBalance: number
    @ViewChild('quantityInput') quantityInput;
    message: string = ""
    fee: number = 10000
    isApp: boolean
    showAdvanced: boolean = false
    numberPeriods: number = 1
    addressbalancesObject: any = {}
    blocktime: number
    duration_days: number = 0
    duration_hours: number = 0
    current_time: number
    locked_until: number
    currentVoteTimestamp: number
    electionProgress: number
    height: number
    dnaRichestAddress: string
    electionInfo: any = {}
    loadingElectionInfo = true

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private alert: AlertProvider,
        private zone: NgZone,
    ) {

        this.candidate = navParams.get('candidate') || ''
        this.quantity = navParams.get('amount') || ''

        this.isApp = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'));

        this.current_time = Date.now()

        this.mvs.getHeight()
            .then(height => {
                this.height = height
                return Promise.all([this.getBlocktime(height), this.getCandidates(height)])
            })
            .then(() => this.durationChange())

        //Load addresses and balances
        Promise.all([this.mvs.getBalances(), this.mvs.getAddresses(), this.mvs.getAddressBalances()])
            .then(([balances, addresses, addressbalancesObject]) => {
                let balance = balances.MST[this.selectedAsset]
                this.balance = (balance && balance.available) ? balance.available : 0
                this.decimals = balance.decimals
                this.etpBalance = balances.ETP.available
                this.showBalance = this.balance
                this.addresses = addresses
                this.addressbalancesObject = addressbalancesObject

                let addrblncs = []
                this.dnaRichestAddress = addresses[0]
                Object.keys(addresses).forEach((index) => {
                    let address = addresses[index]
                    if (addressbalancesObject[address]) {
                        addrblncs.push({ "address": address, "avatar": addressbalancesObject[address].AVATAR ? addressbalancesObject[address].AVATAR : "", "identifier": addressbalancesObject[address].AVATAR ? addressbalancesObject[address].AVATAR : address, "balance": addressbalancesObject[address].MST[this.selectedAsset] ? addressbalancesObject[address].MST[this.selectedAsset].available : 0 })
                        if (addressbalancesObject[address].MST[this.selectedAsset]) {
                            this.dnaRichestAddress = addressbalancesObject[address].MST[this.selectedAsset].available > addressbalancesObject[this.dnaRichestAddress].MST[this.selectedAsset].available ? address : this.dnaRichestAddress
                        }
                    } else {
                        addrblncs.push({ "address": address, "avatar": "", "identifier": address, "balance": 0 })
                    }
                })
                this.addressbalances = addrblncs
            })
    }

    ionViewDidEnter() {
        this.mvs.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
            })
    }

    getBlocktime(height) {
        return this.mvs.getBlocktime(height)
            .then(blocktime => {
                this.blocktime = blocktime
            })
            .catch((error) => {
                console.error(error.message)
            })
    }

    getCandidates(height) {
        return this.mvs.getCandidates()
            .then(electionInfo => {
                this.loadingElectionInfo = false;
                this.electionInfo = electionInfo ? electionInfo : {}

                let startingVoteCycle = (Math.floor((height + this.electionInfo.voteOffset - this.electionInfo.mandateOffset) / this.electionInfo.votePeriod));
                let currentVoteStart = startingVoteCycle * this.electionInfo.votePeriod - this.electionInfo.voteOffset + this.electionInfo.mandateOffset
                this.electionProgress = Math.round((height - currentVoteStart) / this.electionInfo.votePeriod * 100)
                return currentVoteStart
            })
            .then((currentVoteStart) => this.mvs.getBlock(currentVoteStart))
            .then((block) => this.currentVoteTimestamp = block.time_stamp)
            .catch((error) => {
                console.error(error.message)
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
        && this.countDecimals(quantity) == 0
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

    create() {
        return this.alert.showLoading()
            .then(() => {
                let quantity = Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals))
                let locktime = Math.floor(this.numberPeriods * this.electionInfo.votePeriod)
                let attenuation_model = 'PN=0;LH=' + locktime + ';TYPE=1;LQ=' + quantity + ';LP=' + locktime + ';UN=1'
                let messages = [];
                messages.push('vote_supernode:' + this.candidate)
                if (this.message) {
                    messages.push(this.message)
                }
                return this.mvs.createAssetDepositTx(
                    (this.sendFrom != 'auto') ? this.sendFrom : this.dnaRichestAddress ? this.dnaRichestAddress : this.addresses[0],
                    undefined,
                    this.selectedAsset,
                    quantity,
                    attenuation_model,
                    (this.sendFrom != 'auto') ? this.sendFrom : null,
                    (this.showAdvanced && this.changeAddress != 'auto') ? this.changeAddress : undefined,
                    (this.showAdvanced) ? this.fee : 10000,
                    messages
                )
            })
            .catch((error) => {
                console.error(error.message)
                this.alert.stopLoading()
                switch (error.message) {
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
            .then((result) => {
                this.navCtrl.push("confirm-tx-page", { tx: result.encode().toString('hex') })
                this.alert.stopLoading()
            })
            .catch((error) => {
                console.error(error)
                this.alert.stopLoading()
                switch (error.message) {
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
        this.quantity = Math.floor(this.showBalance / Math.pow(10, this.decimals)) + ''
        this.quantityInput.setFocus()
    })

    durationChange() {
        this.zone.run(() => { })
        this.duration_days = Math.floor(this.blocktime * this.numberPeriods * this.electionInfo.votePeriod / (24 * 60 * 60))
        this.duration_hours = Math.floor((this.blocktime * this.numberPeriods * this.electionInfo.votePeriod / (60 * 60)) - (24 * this.duration_days))
        this.locked_until = this.numberPeriods * this.electionInfo.votePeriod * this.blocktime * 1000 + this.current_time;
    }

    validaddress = this.mvs.validAddress

    validFromAddress = (address: string) => address == 'auto' || (this.addressbalancesObject[address] && this.addressbalancesObject[address].ETP.available !== 0)

    validMessageLength = (message) => this.mvs.verifyMessageSize(message) < 253

    arrayList(n: number): any[] {
        return Array(n);
    }

}
