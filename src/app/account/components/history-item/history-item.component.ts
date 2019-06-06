import { Component, OnInit, Input } from '@angular/core';
import { WalletService, Balances, Balance } from 'src/app/services/wallet.service';


@Component({
  selector: 'app-history-item',
  templateUrl: './history-item.component.html',
  styleUrls: ['./history-item.component.scss'],
})
export class HistoryItemComponent implements OnInit {

  @Input() transaction: any;
  addresses$ = this.wallet.addresses$;
  totalInputs: any = {ETP: 0}
  totalOutputs: any = {ETP: 0}
  totalPersonalInputs: any = {ETP: 0}
  totalPersonalOutputs: any = {ETP: 0}
  txFee: number = 0
  devAvatar: string = "developer-community"

  constructor(
    private wallet: WalletService,
  ) { }

  ngOnInit() {

    this.transaction.inputs.forEach(input => {
      this.totalInputs.ETP += input.value
      if(this.addresses$.value.indexOf(input.address) > -1) {
        this.totalPersonalInputs.ETP += input.value
        input.personal = true
      }
    });

    this.transaction.outputs.forEach(output => {
      this.totalOutputs.ETP += output.value
      if(this.addresses$.value.indexOf(output.address) > -1) {
        this.totalPersonalOutputs.ETP += output.value
        output.personal = true
      }
      if(output.attachment.to_did == this.devAvatar)
        this.txFee += output.value
    });

    this.txFee += this.totalInputs.ETP - this.totalOutputs.ETP

  }

}
