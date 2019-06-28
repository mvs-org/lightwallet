import { Component, Input } from '@angular/core';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';

@Component({
    selector: 'tx-item',
    templateUrl: 'tx-item.html'
})
export class TxItemComponent {

    @Input() tx: any;

    decimalsMst: any = {}
    myAddresses: Array<string>
    totalInputs: any = { ETP: 0, MST: {} }
    totalOutputs: any = { ETP: 0, MST: {} }
    totalPersonalInputs: any = { ETP: 0, MST: {} }
    totalPersonalOutputs: any = { ETP: 0, MST: {} }

    constructor(
        private mvs: MvsServiceProvider,
    ) {
        
        console.log("In ionViewDidEnter")
        console.log(this.tx)
        /*this.mvs.getAddresses().then(() => this.myAddresses)
        console.log(this.myAddresses)
        this.tx.inputs.forEach((input) => {
            if (input.previous_output.attachment && (input.previous_output.attachment.type == 'asset-issue' || input.previous_output.attachment.type == 'asset-transfer')) {
                this.totalInputs.MST[input.previous_output.attachment.symbol] = this.totalInputs.MST[input.previous_output.attachment.symbol] ? this.totalInputs.MST[input.previous_output.attachment.symbol] + input.previous_output.attachment.quantity : input.previous_output.attachment.quantity
                this.decimalsMst[input.previous_output.attachment.symbol] = input.previous_output.attachment.decimals
            }
            this.totalInputs.ETP += input.value
            if (this.myAddresses.indexOf(input.address) > -1) {
                this.totalPersonalInputs.ETP += input.value
                if (input.attachment && (input.attachment.type == 'asset-issue' || input.attachment.type == 'asset-transfer')) {
                    this.totalPersonalInputs.MST[input.attachment.symbol] = this.totalPersonalInputs.MST[input.attachment.symbol] ? this.totalPersonalInputs.MST[input.attachment.symbol] + input.attachment.quantity : input.attachment.quantity
                }
                input.personal = true
            }
            console.log(input)
            console.log(this.decimalsMst)
        })*/
    }

}
