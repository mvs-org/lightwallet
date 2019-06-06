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
  txType: string = ''
  devAvatar: string = "developer-community"

  constructor(
    private wallet: WalletService,
  ) { }

  ngOnInit() {

    const TX_TYPE_ETP = 'ETP';
    const TX_TYPE_ASSET = 'ASSET';
    const TX_TYPE_ISSUE = 'ISSUE';
    const TX_TYPE_CERT = 'CERT';
    const TX_TYPE_DID_REGISTER = 'DID_REGISTER';
    const TX_TYPE_DID_TRANSFER = 'DID_TRANSFER';
    const TX_TYPE_MIT = 'MIT';
    const TX_TYPE_COINSTAKE = 'COINSTAKE';
    const TX_TYPE_MST_MINING = 'MST_MINING';

    this.txType = TX_TYPE_ETP

    this.transaction.inputs.forEach(input => {
      this.totalInputs.ETP += input.value
      if(this.addresses$.value.indexOf(input.address) > -1) {
        this.totalPersonalInputs.ETP += input.value
        input.personal = true
      }
    });

    this.transaction.outputs.forEach(output => {
      if (output.attachment.type === 'asset-issue') { //an asset issue has the priority, and contains certs
        this.txType = TX_TYPE_ISSUE;
      } else if (output.attachment.type === 'asset-transfer' && this.txType != TX_TYPE_ISSUE) {
          if(this.transaction.inputs != undefined && Array.isArray(this.transaction.inputs) && this.transaction.inputs[0] && this.transaction.inputs[0].address=='') {
              this.txType = TX_TYPE_MST_MINING;
          } else {
              this.txType = TX_TYPE_ASSET;
          }
      } else if (output.attachment.type === 'asset-cert' && this.txType != TX_TYPE_ISSUE) {
          this.txType = TX_TYPE_CERT;
      } else if (output.attachment.type === 'did-register') {
          this.txType = TX_TYPE_DID_REGISTER;
      } else if (output.attachment.type === 'did-transfer') {
          this.txType = TX_TYPE_DID_TRANSFER;
      } else if (output.attachment.type === 'mit') {
          this.txType = TX_TYPE_MIT;
      } else if (output.attachment.type === 'coinstake') {
          this.txType = TX_TYPE_COINSTAKE;
      }
      this.totalOutputs.ETP += output.value
      if(this.addresses$.value.indexOf(output.address) > -1) {
        this.totalPersonalOutputs.ETP += output.value
        output.personal = true
      }
      if(output.attachment.to_did == this.devAvatar)
        this.txFee += output.value
    });

    this.txFee += this.totalInputs.ETP - this.totalOutputs.ETP
    if(this.txFee < 0)
      this.txFee = 0

  }

}
