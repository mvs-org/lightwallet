import { Component, Input } from '@angular/core';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service';
import { AppGlobals } from '../../app/app.global';

@Component({
    selector: 'input-item',
    templateUrl: 'input-item.html'
})
export class InputItemComponent {

    @Input() input: any;
    @Input() mode: string;

    constructor(
        private mvs: MvsServiceProvider,
        private globals: AppGlobals,
    ) { }

    async loadForeignInput() {
        let previous_output = await this.mvs.getOutput(this.input.previous_output.hash, this.input.previous_output.index)
        this.input.previous_output.script = previous_output.script
        this.input.previous_output.address = previous_output.address
        this.input.previous_output.value = previous_output.value
        this.input.previous_output.attachment = previous_output.attachment
        this.input.address = this.input.previous_output.address
    }

    checkInput = () => window.open(this.explorerURLWithIndex(this.input.previous_output.hash, this.input.previous_output.index), "_blank");

    explorerURLWithIndex = (tx, index) => (this.globals.network == 'mainnet') ? 'https://explorer.mvs.org/tx/' + tx + '?index=' + index : 'https://explorer-testnet.mvs.org/tx/' + tx + '?index=' + index


}
