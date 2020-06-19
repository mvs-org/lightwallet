import { Component, Input, Output, EventEmitter } from '@angular/core'
import { WalletService } from 'src/app/services/wallet.service'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { AppService } from 'src/app/services/app.service'

@Component({
    selector: 'input-item',
    templateUrl: 'input-item.html'
})
export class InputItemComponent {

    @Input() input: any
    @Input() decimalsMst: any
    @Input() mode: string
    network: string

    @Output() modelChanged: EventEmitter<any> = new EventEmitter<any>()

    constructor(
        public mvs: MetaverseService,
        private walletService: WalletService,
        public appService: AppService,
    ) {
        this.init()
    }

    async init() {
        this.network = await this.appService.getNetwork()
    }

    async loadForeignInput() {
        this.input = await this.mvs.addInputData(this.input, await this.mvs.getOutput(this.input.previous_output.hash, this.input.previous_output.index))
        this.modelChanged.emit(this.input)
    }

    checkInput = () => this.walletService.openLink(this.explorerURLWithIndex(this.input.previous_output.hash, this.input.previous_output.index))

    explorerURLWithIndex = (tx, index) => (this.network === 'mainnet') ? 'https://explorer.mvs.org/tx/' + tx + '?index=' + index : 'https://explorer-testnet.mvs.org/tx/' + tx + '?index=' + index


}
