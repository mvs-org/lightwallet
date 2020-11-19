import { Component, Input, SimpleChanges } from '@angular/core';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AppGlobals } from '../../app/app.global';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { WalletServiceProvider } from '../../providers/wallet-service/wallet-service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'tx-item',
    templateUrl: 'tx-item.html',
    animations: [
        trigger('expandCollapse', [
            state('expandCollapseState', style({ height: '*' })),
            transition('* => void', [style({ height: '*' }), animate(500, style({ height: "0" }))]),
            transition('void => *', [style({ height: '0' }), animate(500, style({ height: "*" }))])
        ])
    ],
})
export class TxItemComponent {

    @Input() tx: any;
    @Input() hexTx: any;
    @Input() mode: string;
    @Input() status: string     //to_confirm, pending or mined
    @Input() addresses?: Array<string>
    @Input() multisig?: Object = {}
    @Input() height?: number;

    decimalsMst: any = {}
    totalInputs: any = { ETP: 0, MST: {} }
    totalOutputs: any = { ETP: 0, MST: {} }
    totalPersonalInputs: any = { ETP: 0, MST: {} }
    totalPersonalOutputs: any = { ETP: 0, MST: {} }
    involvedMst: Array<string>
    txFee: number = 0
    txType: string = ''
    txTypeValue: string = ''
    txTypeCert: string = ''
    devAvatar: string

    constructor(
        private mvs: MvsServiceProvider,
        private globals: AppGlobals,
        private wallet: WalletServiceProvider,
        public translate: TranslateService,
    ) {
        this.devAvatar = this.globals.dev_avatar
    }

    ngOnChanges(changes: SimpleChanges) {
        this.inputChange()
    }

    countable(input){
        return this.addresses.indexOf(input.previous_output.address) > -1
    }

    async inputChange() {

        if(!this.addresses || this.addresses == []) {
            const addresses = await this.mvs.getAddresses()
            const multisigAddresses = await this.wallet.getMultisigAddresses()
            this.addresses = addresses.concat(multisigAddresses)
        }

        this.totalInputs = { ETP: 0, MST: {} }
        this.totalOutputs = { ETP: 0, MST: {} }
        this.totalPersonalInputs = { ETP: 0, MST: {} }
        this.totalPersonalOutputs = { ETP: 0, MST: {} }
        this.txFee = 0

        const TX_TYPE_ETP = 'ETP';
        const TX_TYPE_ETP_LOCK = 'ETP_LOCK';
        const TX_TYPE_ETP_LOCK_REWARD = 'ETP_LOCK_REWARD';
        const TX_TYPE_ASSET = 'ASSET';
        const TX_TYPE_MST_LOCK = 'MST_LOCK';
        const TX_TYPE_ISSUE = 'ISSUE';
        const TX_TYPE_CERT = 'CERT';
        const TX_TYPE_DID_REGISTER = 'DID_REGISTER';
        const TX_TYPE_DID_TRANSFER = 'DID_TRANSFER';
        const TX_TYPE_MIT_REGISTERED = 'MIT_REGISTERED';
        const TX_TYPE_MIT_TRANSFERED = 'MIT_TRANSFERED';
        const TX_TYPE_COINSTAKE = 'COINSTAKE';
        const TX_TYPE_MINING_REWARD = 'MINING_REWARD';
        const TX_TYPE_BURN_ETP = 'BURN_ETP';
        const TX_TYPE_BURN_MST = 'BURN_MST';
        const TX_TYPE_DNA_VOTE = 'DNA_VOTE';
        const TX_TYPE_UNKNOWN = 'UNKNOWN'

        this.tx.inputs.forEach((input) => {
            if (input.previous_output.attachment && (input.previous_output.attachment.type == 'asset-issue' || input.previous_output.attachment.type == 'asset-transfer')) {
                this.totalInputs.MST[input.previous_output.attachment.symbol] = this.totalInputs.MST[input.previous_output.attachment.symbol] && input.previous_output.attachment.quantity ? this.totalInputs.MST[input.previous_output.attachment.symbol] + input.previous_output.attachment.quantity : input.previous_output.attachment.quantity
            }
            if (input.previous_output.value) {
                this.totalInputs.ETP += input.previous_output.value
            }
            if (this.countable(input)) {
                this.totalPersonalInputs.ETP += input.previous_output.value
                if (input.previous_output.attachment && (input.previous_output.attachment.type == 'asset-issue' || input.previous_output.attachment.type == 'asset-transfer')) {
                    this.totalPersonalInputs.MST[input.previous_output.attachment.symbol] = this.totalPersonalInputs.MST[input.previous_output.attachment.symbol] ? this.totalPersonalInputs.MST[input.previous_output.attachment.symbol] + input.previous_output.attachment.quantity : input.previous_output.attachment.quantity

                    //If there is no change output for the MST, we put the personal output to 0
                    if (!this.totalPersonalOutputs.MST[input.previous_output.attachment.symbol]) {
                        this.totalPersonalOutputs.MST[input.previous_output.attachment.symbol] = 0
                    }
                }
                input.personal = true
            }
        })

        this.txType = TX_TYPE_UNKNOWN
        this.tx.outputs.forEach(output => {
            switch (output.attachment.type) {
                case 'asset-issue':
                    this.decimalsMst[output.attachment.symbol] = output.attachment.precision ? output.attachment.precision : output.attachment.decimals
                    output.attachment.quantity = output.attachment.max_supply ? output.attachment.max_supply : output.attachment.original_quantity
                    this.totalInputs.MST[output.attachment.symbol] = this.totalInputs.MST[output.attachment.symbol] || 0
                    this.totalPersonalInputs.MST[output.attachment.symbol] = this.totalPersonalInputs.MST[output.attachment.symbol] || 0
                    this.txType = TX_TYPE_ISSUE
                    this.txTypeValue = output.attachment.symbol
                    break;
                case 'asset-transfer':
                    if (this.txType != TX_TYPE_ISSUE && this.txType != TX_TYPE_BURN_MST) {
                        this.decimalsMst[output.attachment.symbol] = output.attachment.decimals
                        this.txTypeValue = output.attachment.symbol
                        if (this.tx.inputs != undefined && Array.isArray(this.tx.inputs) && this.tx.inputs[0] && this.tx.inputs[0].previous_output.hash == '0000000000000000000000000000000000000000000000000000000000000000') {
                            this.txType = TX_TYPE_MINING_REWARD
                        } else if (output.script === 'OP_RETURN') {
                            this.txType = TX_TYPE_BURN_MST
                            this.translate.get(['TX.TYPE.BURN']).subscribe((translations: any) => {
                                output.address = translations['TX.TYPE.BURN']
                            })
                        } else if (output.attenuation_model_param) {
                            this.tx.locked_until = this.tx.height + output.attenuation_model_param.lock_period
                            this.tx.locked_quantity = output.attenuation_model_param.lock_quantity
                            if(this.txType != TX_TYPE_DNA_VOTE) {
                                this.txType = TX_TYPE_MST_LOCK
                            }
                        } else if (this.txType != TX_TYPE_MST_LOCK && this.txType != TX_TYPE_DNA_VOTE) {
                            this.txType = TX_TYPE_ASSET
                        }
                    }
                    break;
                case 'asset-cert':
                    if (this.txType != TX_TYPE_ISSUE) {
                        this.txType = TX_TYPE_CERT
                        this.txTypeCert = output.attachment.cert
                        this.txTypeValue = output.attachment.symbol
                    }
                    break;
                case 'did-register':
                    this.txType = TX_TYPE_DID_REGISTER
                    this.txTypeValue = output.attachment.symbol
                    break;
                case 'did-transfer':
                    this.txType = TX_TYPE_DID_TRANSFER
                    this.txTypeValue = output.attachment.symbol
                    break;
                case 'mit':
                    this.txType = output.attachment.status == 'registered' ? TX_TYPE_MIT_REGISTERED : TX_TYPE_MIT_TRANSFERED
                    this.txTypeValue = output.attachment.symbol
                    break;
                case 'coinstake':
                    this.txType = TX_TYPE_COINSTAKE
                    break;
                case 'message':
                    if (output.attachment.content && output.attachment.content.indexOf('vote_supernode:') === 0) {
                        this.txType = TX_TYPE_DNA_VOTE
                    } else if (this.txType === TX_TYPE_UNKNOWN) {
                        this.txType = TX_TYPE_ETP
                    }
                    break;
                case 'etp':
                    if (this.txType === TX_TYPE_UNKNOWN) {
                        if (output.script === 'OP_RETURN') {
                            this.txType = TX_TYPE_BURN_ETP
                            this.translate.get(['TX.TYPE.BURN']).subscribe((translations: any) => {
                                output.address = translations['TX.TYPE.BURN']
                            })
                        } else if (output.locked_height_range) {
                            this.tx.locked_until = this.tx.height + output.locked_height_range
                            this.tx.locked_quantity = output.value
                            this.txType = this.tx.inputs[0].previous_output.hash == '0000000000000000000000000000000000000000000000000000000000000000' ? TX_TYPE_ETP_LOCK_REWARD : TX_TYPE_ETP_LOCK
                        } else if (this.tx.inputs[0].previous_output.hash == '0000000000000000000000000000000000000000000000000000000000000000') {
                            this.txType = TX_TYPE_MINING_REWARD
                        } else {
                            this.txType = TX_TYPE_ETP
                        }
                        this.txTypeValue = 'ETP'
                    }
                    break;
                default:
                    break;
            }

            this.totalOutputs.ETP += output.value
            if (output.attachment && (output.attachment.type == 'asset-issue' || output.attachment.type == 'asset-transfer')) {
                this.totalOutputs.MST[output.attachment.symbol] = this.totalOutputs.MST[output.attachment.symbol] ? this.totalOutputs.MST[output.attachment.symbol] + output.attachment.quantity : output.attachment.quantity
            }

            if (this.addresses.indexOf(output.address) > -1) {
                if (output.value) {
                    this.totalPersonalOutputs.ETP += output.value
                }
                if (output.attachment && (output.attachment.type == 'asset-issue' || output.attachment.type == 'asset-transfer')) {
                    this.totalPersonalOutputs.MST[output.attachment.symbol] = this.totalPersonalOutputs.MST[output.attachment.symbol] ? this.totalPersonalOutputs.MST[output.attachment.symbol] + output.attachment.quantity : output.attachment.quantity
                }
                output.personal = true
            }
            if (output.attachment.to_did == this.devAvatar)
                this.txFee += output.value

        });

        this.involvedMst = Object.keys(this.decimalsMst)

        this.txFee += this.totalInputs.ETP - this.totalOutputs.ETP
        if (this.txFee < 0)
            this.txFee = 0
    }

    async showHideDetails() {
        this.mode = this.mode == 'summary' ? 'satoshi' : 'summary'
    }

    checkTx = () => this.wallet.openLink(this.explorerURL(this.tx.hash));

    explorerURL = (tx) => (this.globals.network == 'mainnet') ? 'https://explorer.mvs.org/tx/' + tx : 'https://explorer-testnet.mvs.org/tx/' + tx

    inputLoad(input, index) {
        this.tx.inputs[index] = input
        this.inputChange()
    }
}
