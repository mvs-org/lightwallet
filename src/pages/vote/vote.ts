import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AlertProvider } from '../../providers/alert/alert';
import { AppGlobals } from '../../app/app.global';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import compareVersions from 'compare-versions';

@IonicPage({
    name: 'vote-page',
    segment: 'vote'
})
@Component({
    selector: 'page-vote',
    templateUrl: 'vote.html',
    animations: [
        trigger('expandCollapse', [
            state('expandCollapseState', style({ height: '*' })),
            transition('* => void', [style({ height: '*' }), animate(500, style({ height: "0" }))]),
            transition('void => *', [style({ height: '0' }), animate(500, style({ height: "*" }))])
        ])
    ],
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
    fee: number
    defaultFee: number
    isApp: boolean
    showAdvanced: boolean = false
    numberPeriods: number = 1
    addressbalancesObject: any = {}
    blocktime: number
    duration_days: number = 0
    duration_hours: number = 0
    current_time: number
    locked_until: number
    unlock_time: number
    currentVoteTimestamp: number
    currentRevoteTimestamp: number
    electionProgressVote: number
    electionProgressRevote: number
    height: number
    dnaRichestAddress: string
    //electionInfo: any = {}
    earlybirdInfo: any = {}
    loadingElectionInfo = true
    lockPeriod: number
    unlockPeriods: Array<number>

    display_segment: string = "vote"
    frozen_outputs_locked: any[] = []
    frozen_outputs_unlocked: any[] = []
    revote_outputs: any[] = []
    revote_already_used_outputs: any[] = []
    availableUtxos: any = {}
    notPreviouslyVoteUtxo: any[] = []
    notPreviouslyVoteQuantity: number = 0
    rewards: any = {}
    updateRequired: boolean = false
    requiredVersion: string = 'unknown'

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private mvs: MvsServiceProvider,
        public platform: Platform,
        private alert: AlertProvider,
        private globals: AppGlobals,
        private wallet: WalletServiceProvider,
    ) {

        this.candidate = navParams.get('candidate') || ''
        this.quantity = navParams.get('amount') || ''

        this.isApp = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'));

        this.current_time = Date.now()

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

        this.fee = this.globals.default_fees.default
        this.defaultFee = this.fee
        this.mvs.getFees()
            .then(fees => {
                this.fee = fees.default
                this.defaultFee = this.fee
            })
    }

    ionViewDidEnter() {
        this.mvs.getAddresses()
            .then((addresses) => {
                if (!Array.isArray(addresses) || !addresses.length)
                    this.navCtrl.setRoot("LoginPage")
            })

        this.mvs.getHeight()
            .then(height => {
                this.height = height
                return Promise.all([this.getBlocktime(height), this.getElectionInfo(height)])
            })
            .then(() => this.durationChange())
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

    getElectionInfo(localHeight) {
        return this.mvs.getElectionInfo()
            .then(earlybirdInfo => {
                this.updateRequired = compareVersions(this.globals.version, earlybirdInfo.walletVersionSupport) == -1
                this.requiredVersion = earlybirdInfo.walletVersionSupport
                this.height = Math.max(localHeight, earlybirdInfo.height)
                this.loadingElectionInfo = false

                this.earlybirdInfo = earlybirdInfo ? earlybirdInfo : {}
                this.unlockPeriods = earlybirdInfo.votesUnlockPeriods.slice(earlybirdInfo.currentPeriod - 1)
                this.locked_until = this.unlockPeriods[0]
                this.lockPeriod = this.unlockPeriods[0] - this.height
                this.electionProgressVote = Math.round((this.height - this.earlybirdInfo.voteStartHeight) / (this.earlybirdInfo.voteEndHeight - this.earlybirdInfo.voteStartHeight) * 100)
                this.electionProgressRevote = Math.round((this.height - this.earlybirdInfo.revoteStartHeight) / (this.earlybirdInfo.revoteEndHeight - this.earlybirdInfo.revoteStartHeight) * 100)
                return earlybirdInfo.voteStartHeight
            })
            .then((currentVoteStart) => currentVoteStart ? this.mvs.getBlock(currentVoteStart) : 0)
            .then((block) => this.currentVoteTimestamp = block && block.time_stamp ? block.time_stamp : 0)
            .then(() => this.earlybirdInfo.revoteStartHeight ? this.mvs.getBlock(this.earlybirdInfo.revoteStartHeight) : 0)
            .then((block) => this.currentRevoteTimestamp = block && block.time_stamp ? block.time_stamp : 0)
            .then(() => this.getNotPreviouslyVoteUtxo())
            .then(() => this.calculateFrozenOutputs(this.height))
            .catch((error) => {
                console.error(error.message)
            })
    }

    getNotPreviouslyVoteUtxo() {
        if (this.earlybirdInfo) {
            this.notPreviouslyVoteUtxo = []
            this.notPreviouslyVoteQuantity = 0
            this.mvs.getUtxo()
                .then(utxos => {
                    utxos.forEach(utxo => {
                        this.availableUtxos[utxo.hash + '/' + utxo.index] = utxo
                        if (utxo.attachment.symbol == this.selectedAsset && utxo.attachment.type == 'asset-transfer' && (!utxo.attenuation_model_param || utxo.height + utxo.attenuation_model_param.lock_period < this.earlybirdInfo.previousVoteEndHeight)) {
                            this.notPreviouslyVoteUtxo.push(utxo)
                            this.notPreviouslyVoteQuantity += utxo.attachment.quantity
                        }
                    })
                })

        }
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
        && this.showBalance >= parseFloat(quantity) * Math.pow(10, this.decimals)
        && (quantity > 0)

    validRevoteQuantity = (output) => output.newVoteAmount != undefined
        && this.countDecimals(output.newVoteAmount) == 0
        && output.maxVoteAmount >= output.newVoteAmount
        && output.newVoteAmount > 0

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
            .then(() => this.mvs.updateHeight())
            .then((height) => {
                this.lockPeriod = this.locked_until - height
                let quantity = Math.round(parseFloat(this.quantity) * Math.pow(10, this.decimals))
                let attenuation_model = 'PN=0;LH=' + this.lockPeriod + ';TYPE=1;LQ=' + quantity + ';LP=' + this.lockPeriod + ';UN=1'
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

    /*durationChange() {
        this.zone.run(() => { })
        this.duration_days = Math.floor(this.blocktime * this.numberPeriods * this.electionInfo.lockPeriod / (24 * 60 * 60))
        this.duration_hours = Math.floor((this.blocktime * this.numberPeriods * this.electionInfo.lockPeriod / (60 * 60)) - (24 * this.duration_days))
        this.locked_until = this.numberPeriods * this.electionInfo.lockPeriod * this.blocktime * 1000 + this.current_time;
    }*/

    durationChange() {
        this.lockPeriod = this.locked_until - this.height
        this.duration_days = Math.floor(this.blocktime * this.lockPeriod / (24 * 60 * 60))
        this.duration_hours = Math.floor((this.blocktime * this.lockPeriod / (60 * 60)) - (24 * this.duration_days))
        this.unlock_time = this.lockPeriod * this.blocktime * 1000 + this.current_time;
    }

    validaddress = this.mvs.validAddress

    validFromAddress = (address: string) => address == 'auto' || (this.addressbalancesObject[address] && this.addressbalancesObject[address].ETP.available !== 0)

    validMessageLength = (message) => this.mvs.verifyMessageSize(message) < 253

    arrayList(n: number): any[] {
        return Array(n);
    }

    checkElection = () => this.wallet.openLink('https://' + this.electionURL())

    electionURL = () => (this.globals.network == 'mainnet') ? "www.dnavote.com" : "uat.dnavote.com"

    async calculateFrozenOutputs(localHeight) {
        let outputs = await this.mvs.getFrozenOutputs(this.selectedAsset)
        let txs = await this.mvs.getTransactionMap()
        this.frozen_outputs_locked = []
        this.frozen_outputs_unlocked = []
        let frozen_outputs_locked_hash = []
        let frozen_outputs_unlocked_hash = []
        this.revote_outputs = []
        outputs.forEach((locked_output) => {
            let tx = txs[locked_output.hash]
            for (let i = 0; i < tx.outputs.length; i++) {
                let output = tx.outputs[i]
                if (output.attachment.type == 'message' && /^vote_([a-z0-9]+)\:([A-Za-z0-9-_@\.]+)$/.test(output.attachment.content)) {
                    locked_output.voteType = /^vote_([a-z0-9]+)\:/.test(output.attachment.content) ? output.attachment.content.match(/^vote_([a-z0-9]+)\:/)[1] : 'Invalid Type';
                    locked_output.voteAvatar = /\:([A-Za-z0-9-_@\.]+)$/.test(output.attachment.content) ? output.attachment.content.match(/\:([A-Za-z0-9-_@\.]+)$/)[1] : 'Invalid Avatar';
                }
            }

            if (localHeight > locked_output.locked_until) {
                this.frozen_outputs_unlocked.push(locked_output)
                frozen_outputs_unlocked_hash.push(locked_output.hash)
                if (locked_output.height + locked_output.attenuation_model_param.lock_period < this.earlybirdInfo.previousVoteEndHeight) {
                    //Previous vote that was not reused on time
                } else if (this.availableUtxos[locked_output.hash + '/' + locked_output.index]) {
                    this.revote_outputs.push(locked_output)
                } else {
                    this.revote_already_used_outputs.push(locked_output)
                }
            } else {
                this.frozen_outputs_locked.push(locked_output)
                frozen_outputs_locked_hash.push(locked_output.hash)
            }
        })
        let frozen_rewards_locked_result = await this.wallet.getElectionRewards(frozen_outputs_locked_hash)
        let rewards = frozen_rewards_locked_result && frozen_rewards_locked_result.json() ? frozen_rewards_locked_result.json().result : []

        let frozen_rewards_unlocked_result = await this.wallet.getElectionRewards(frozen_outputs_unlocked_hash)
        rewards = rewards.concat(frozen_rewards_unlocked_result && frozen_rewards_unlocked_result.json() ? frozen_rewards_unlocked_result.json().result : [])

        //TO DELETE
        /*let test = await this.wallet.getElectionRewards(['5dd276da9f2ab08bdef125911504307336e4f5e4fecba399facd08f71e719778'])
        rewards = rewards.concat(test.json().result)
        console.log(rewards)
        this.rewards['a83080dec232d964c71d7c2d41edaf6c6c3cac9242d02f5808874c70bb74b045'] = 1000
        */
        //UNTIL HERE

        if (rewards) {
            rewards.forEach(reward => {
                this.rewards[reward.txid] = reward.reward
            })
        }

        this.revote_outputs.forEach(output => {
            output.initialVoteAmount = Math.round(output.attachment.quantity / Math.pow(10, this.decimals))

            let maxPossibleVote = Math.floor(this.rewards[output.tx] ? output.initialVoteAmount + this.rewards[output.tx] : output.initialVoteAmount)
            let maxAvailableVote = Math.floor(this.notPreviouslyVoteQuantity ? output.initialVoteAmount + (this.notPreviouslyVoteQuantity / Math.pow(10, this.decimals)) : output.initialVoteAmount)

            output.newVoteAmount = Math.min(maxPossibleVote, maxAvailableVote)
            output.newVoteAmountWarningNotMax = maxPossibleVote > maxAvailableVote
            output.maxVoteAmount = output.newVoteAmount
        })

    }

    voteAgain(locked_output) {
        return this.alert.showLoading()
            .then(() => this.mvs.updateHeight())
            .then((height) => {
                this.lockPeriod = this.locked_until - height
                let quantity = Math.round(parseFloat(locked_output.newVoteAmount) * Math.pow(10, this.decimals))
                let attenuation_model = 'PN=0;LH=' + this.lockPeriod + ';TYPE=1;LQ=' + quantity + ';LP=' + this.lockPeriod + ';UN=1'
                let messages = [];
                messages.push('vote_supernode:' + locked_output.voteAvatar)
                if (this.message) {
                    messages.push(this.message)
                }
                let notPreviouslyVote = 0
                let utxo_to_use = [locked_output]
                let targetNotPreviouslyVote = quantity - locked_output.attachment.quantity

                //First we try to match the same sender address
                for (let i = 0; i < this.notPreviouslyVoteUtxo.length; i++) {
                    let current_utxo = this.notPreviouslyVoteUtxo[i]
                    if (current_utxo.address == locked_output.address) {
                        utxo_to_use.push(current_utxo)
                        notPreviouslyVote += current_utxo.attachment.quantity
                        if (notPreviouslyVote >= targetNotPreviouslyVote) {
                            break
                        }
                    }
                }

                //If we didn't find any result, we take any other address
                if (notPreviouslyVote < targetNotPreviouslyVote) {
                    for (let i = 0; i < this.notPreviouslyVoteUtxo.length; i++) {
                        let current_utxo = this.notPreviouslyVoteUtxo[i]
                        if (current_utxo.address !== locked_output.address) {
                            utxo_to_use.push(current_utxo)
                            notPreviouslyVote += current_utxo.attachment.quantity
                            if (notPreviouslyVote >= targetNotPreviouslyVote) {
                                break
                            }
                        }
                    }
                }

                return this.mvs.voteAgainTx(
                    utxo_to_use,
                    locked_output.address,
                    undefined,
                    this.selectedAsset,
                    quantity,
                    attenuation_model,
                    undefined,
                    10000,
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

    sendVoteAgain(locked_ouput) {
        this.voteAgain(locked_ouput)
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

    changeTab() {
        this.revote_outputs.forEach((output) => {
            output.show = false
        })
    }

}