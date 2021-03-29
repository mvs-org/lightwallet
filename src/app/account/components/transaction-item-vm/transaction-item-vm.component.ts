import { Component, Input, SimpleChanges } from '@angular/core'
import { trigger, style, animate, transition } from '@angular/animations'
import { TranslateService } from '@ngx-translate/core'
import { AppService } from 'src/app/services/app.service'
import { WalletService } from 'src/app/services/wallet.service'

@Component({
    selector: 'tx-item-vm',
    templateUrl: 'transaction-item-vm.component.html',
    animations: [
        trigger('expandCollapse', [
            transition('* => void', [style({ height: '*' }), animate(500, style({ height: '0' }))]),
        ])
    ],
    styleUrls: ['./transaction-item-vm.component.scss'],
})
export class TransactionItemVmComponent {

    @Input() params: any
    @Input() status: string     // to_confirm, pending or mined
    @Input() addresses?: Array<string>
    @Input() height?: number
    @Input() from: string

    decimalsMst: any = {}
    totalInputs: any = { ETP: 0, MST: {} }
    totalOutputs: any = { ETP: 0, MST: {} }
    totalPersonalInputs: any = { ETP: 0, MST: {} }
    totalPersonalOutputs: any = { ETP: 0, MST: {} }
    involvedMst: Array<string>
    txFee = 0
    txType = 'VM_ETP'
    devAvatar: string

    constructor(
        public appService: AppService,
        public walletService: WalletService,
        public translate: TranslateService,
    ) {
        console.log(this.params)
    }

    ngOnChanges(changes: SimpleChanges) {

    }

    myAddress(address) {
        return this.addresses.indexOf(address) > -1
    }

    checkTx = () => console.log("TODO")//this.walletService.openLink(this.explorerURL(this.tx.hash))

    explorerURL = (tx) => (this.appService.network === 'mainnet') ? 'https://explorer.mvs.org/tx/' + tx : 'https://explorer-testnet.mvs.org/tx/' + tx

}
