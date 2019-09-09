import { Component, Input, SimpleChanges } from '@angular/core';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AppGlobals } from '../../app/app.global';

@Component({
    selector: 'tx-item',
    templateUrl: 'tx-item.html'
})
export class TxItemComponent {

    @Input() tx: any;
    @Input() hexTx: any;
    @Input() mode: string;
    @Input() signStatus: string
    @Input() title: boolean = true

    decimalsMst: any = {}
    myAddresses: Array<string> = []
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
    current_time: number

    constructor(
        private mvs: MvsServiceProvider,
        private globals: AppGlobals,
    ) {
        this.devAvatar = this.globals.dev_avatar
    }

    async ngAfterViewInit() {

        this.myAddresses = await this.mvs.getAddresses()

        this.inputChange()

    }

    ngOnChanges(changes: SimpleChanges) {
        this.inputChange()
    }

    inputChange() {

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
        const TX_TYPE_MST_MINING = 'MST_MINING';
        const TX_TYPE_UNKNOWN = 'UNKNOWN'

        this.tx.inputs.forEach((input) => {
            if (input.previous_output.attachment && (input.previous_output.attachment.type == 'asset-issue' || input.previous_output.attachment.type == 'asset-transfer')) {
                this.totalInputs.MST[input.previous_output.attachment.symbol] = this.totalInputs.MST[input.previous_output.attachment.symbol] ? this.totalInputs.MST[input.previous_output.attachment.symbol] + input.previous_output.attachment.quantity : input.previous_output.attachment.quantity
                this.decimalsMst[input.previous_output.attachment.symbol] = input.previous_output.attachment.decimals
            }
            this.totalInputs.ETP += input.previous_output.value
            if (this.myAddresses.indexOf(input.previous_output.address) > -1) {
                this.totalPersonalInputs.ETP += input.previous_output.value
                if (input.previous_output.attachment && (input.previous_output.attachment.type == 'asset-issue' || input.previous_output.attachment.type == 'asset-transfer')) {
                    this.totalPersonalInputs.MST[input.previous_output.attachment.symbol] = this.totalPersonalInputs.MST[input.previous_output.attachment.symbol] ? this.totalPersonalInputs.MST[input.previous_output.attachment.symbol] + input.previous_output.attachment.quantity : input.previous_output.attachment.quantity

                    //If there is no change output for the MST, we put the personal output to 0
                    if(!this.totalPersonalOutputs.MST[input.previous_output.attachment.symbol]) {
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
                    this.decimalsMst[output.attachment.symbol] = output.attachment.precision
                    output.attachment.quantity = output.attachment.max_supply
                    this.totalInputs.MST[output.attachment.symbol] = this.totalInputs.MST[output.attachment.symbol] || 0
                    this.totalPersonalInputs.MST[output.attachment.symbol] = this.totalPersonalInputs.MST[output.attachment.symbol] || 0
                    this.txType = TX_TYPE_ISSUE
                    this.txTypeValue = output.attachment.symbol
                    break;
                case 'asset-transfer':
                    if (this.txType != TX_TYPE_ISSUE) {
                        this.txTypeValue = output.attachment.symbol
                        if (this.tx.inputs != undefined && Array.isArray(this.tx.inputs) && this.tx.inputs[0] && this.tx.inputs[0].previous_output.address == '') {
                            this.txType = TX_TYPE_MST_MINING
                        } else if (output.attenuation_model_param) {
                            this.tx.locked_until = this.tx.height + output.attenuation_model_param.lock_period
                            this.tx.locked_quantity = output.attenuation_model_param.lock_quantity
                            this.txType = TX_TYPE_MST_LOCK
                        } else if (this.txType != TX_TYPE_MST_LOCK) {
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
                    this.txType = TX_TYPE_ETP
                    break;
                case 'etp':
                    if(this.txType === TX_TYPE_UNKNOWN) {
                        if (output.locked_height_range) {
                        this.tx.locked_until = this.tx.height + output.locked_height_range
                        this.tx.locked_quantity = output.value
                        this.txType = this.tx.inputs[0].previous_output.hash == "0000000000000000000000000000000000000000000000000000000000000000" ? TX_TYPE_ETP_LOCK_REWARD : TX_TYPE_ETP_LOCK
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

            if (this.myAddresses.indexOf(output.address) > -1) {
                this.totalPersonalOutputs.ETP += output.value
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
        if(this.txFee < 0)
            this.txFee = 0
    }

}
