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
        this.input = this.mvs.addInputData(this.input, await this.mvs.getOutput(this.input.previous_output.hash, this.input.previous_output.index))
    }

    checkInput = () => window.open(this.explorerURLWithIndex(this.input.previous_output.hash, this.input.previous_output.index), "_blank");

    explorerURLWithIndex = (tx, index) => (this.globals.network == 'mainnet') ? 'https://explorer.mvs.org/tx/' + tx + '?index=' + index : 'https://explorer-testnet.mvs.org/tx/' + tx + '?index=' + index


}
