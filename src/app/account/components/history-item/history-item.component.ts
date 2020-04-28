import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';


@Component({
  selector: 'app-history-item',
  templateUrl: './history-item.component.html',
  styleUrls: ['./history-item.component.scss'],
})
export class HistoryItemComponent implements OnInit {

  @Input() transaction: any
  @Input() height$: any
  @Input() blocktime: number
  height: number
  totalInputs: any = {ETP: 0, MST: {}}
  totalOutputs: any = {ETP: 0, MST: {}}
  totalPersonalInputs: any = {ETP: 0, MST: {}}
  totalPersonalOutputs: any = {ETP: 0, MST: {}}
  decimals: any = {ETP: 8, MST: {}}
  txFee: number = 0
  txType: string = ''
  txTypeValue: string = ''
  txTypeCert: string = ''
  devAvatar: string = "developer-community"
  current_time: number

  constructor(
    private wallet: WalletService,
  ) { 
    this.current_time = Date.now()
  }

  async ngOnInit() {

    this.height$.subscribe((data) => {
      this.height = data
      if(this.transaction.locked_until && this.transaction.locked_until > this.height) 
        this.transaction.locked_progression = this.depositProgress(this.transaction.outputs[0].height, this.height, this.transaction.locked_until)
    })

    const TX_TYPE_ETP = 'ETP';
    const TX_TYPE_ETP_LOCK = 'ETP_LOCK';
    const TX_TYPE_ETP_LOCK_REWARD = 'ETP_LOCK_REWARD';
    const TX_TYPE_ASSET = 'ASSET';
    const TX_TYPE_MST_LOCK = 'MST_LOCK';
    const TX_TYPE_ISSUE = 'ISSUE';
    const TX_TYPE_CERT = 'CERT';
    const TX_TYPE_DID_REGISTER = 'DID_REGISTER';
    const TX_TYPE_DID_TRANSFER = 'DID_TRANSFER';
    const TX_TYPE_MIT = 'MIT';
    const TX_TYPE_COINSTAKE = 'COINSTAKE';
    const TX_TYPE_MST_MINING = 'MST_MINING';

    this.txType = TX_TYPE_ETP

    const addresses = await this.wallet.getAddresses().toPromise()

    this.transaction.inputs.forEach(input => {
      if(input.attachment && (input.attachment.type == 'asset-issue' || input.attachment.type == 'asset-transfer')) {
        this.totalInputs.MST[input.attachment.symbol] = this.totalInputs.MST[input.attachment.symbol] ? this.totalInputs.MST[input.attachment.symbol] + input.attachment.quantity : input.attachment.quantity
        this.decimals.MST[input.attachment.symbol] = input.attachment.decimals
      }
      this.totalInputs.ETP += input.value
      if(addresses.indexOf(input.address) > -1) {
        this.totalPersonalInputs.ETP += input.value
        if(input.attachment && (input.attachment.type == 'asset-issue' || input.attachment.type == 'asset-transfer')) {
          this.totalPersonalInputs.MST[input.attachment.symbol] = this.totalPersonalInputs.MST[input.attachment.symbol] ? this.totalPersonalInputs.MST[input.attachment.symbol] + input.attachment.quantity : input.attachment.quantity
        }
        input.personal = true
      }
    });

    this.transaction.outputs.forEach(output => {
      if (output.attachment.type === 'asset-issue') { //an asset issue has the priority, and contains certs
        this.txType = TX_TYPE_ISSUE
        this.txTypeValue = output.attachment.symbol
      } else if (output.attachment.type === 'asset-transfer' && this.txType != TX_TYPE_ISSUE) {
        this.txTypeValue = output.attachment.symbol
        if(this.transaction.inputs != undefined && Array.isArray(this.transaction.inputs) && this.transaction.inputs[0] && this.transaction.inputs[0].address=='') {
          this.txType = TX_TYPE_MST_MINING
        } else if (output.attenuation_model_param) {
          this.transaction.locked_until = this.transaction.height + output.attenuation_model_param.lock_period
          this.transaction.locked_quantity = output.attenuation_model_param.lock_quantity
          this.txType = TX_TYPE_MST_LOCK
        } else if (this.txType != TX_TYPE_MST_LOCK) {
          this.txType = TX_TYPE_ASSET
        }
      } else if (output.attachment.type === 'asset-cert' && this.txType != TX_TYPE_ISSUE) {
        this.txType = TX_TYPE_CERT
        this.txTypeCert =  output.attachment.cert
        this.txTypeValue = output.attachment.symbol
      } else if (output.attachment.type === 'did-register') {
        this.txType = TX_TYPE_DID_REGISTER
        this.txTypeValue = output.attachment.symbol
      } else if (output.attachment.type === 'did-transfer') {
        this.txType = TX_TYPE_DID_TRANSFER
        this.txTypeValue = output.attachment.symbol
      } else if (output.attachment.type === 'mit') {
        this.txType = TX_TYPE_MIT
        this.txTypeValue = output.attachment.symbol
      } else if (output.attachment.type === 'coinstake') {
        this.txType = TX_TYPE_COINSTAKE
      } else if (output.attachment.type == 'etp' && output.locked_height_range) {
        this.transaction.locked_until = this.transaction.height + output.locked_height_range
        this.transaction.locked_quantity = output.value
        this.txType = this.transaction.inputs[0].previous_output.hash == "0000000000000000000000000000000000000000000000000000000000000000" ? TX_TYPE_ETP_LOCK_REWARD : TX_TYPE_ETP_LOCK
        this.txTypeValue = 'ETP'
      }

      this.totalOutputs.ETP += output.value
      if(output.attachment && (output.attachment.type == 'asset-issue' || output.attachment.type == 'asset-transfer')) {
        this.decimals.MST[output.attachment.symbol] = output.attachment.decimals
        this.totalOutputs.MST[output.attachment.symbol] = this.totalOutputs.MST[output.attachment.symbol] ? this.totalOutputs.MST[output.attachment.symbol] + output.attachment.quantity : output.attachment.quantity
      }

      if(addresses.indexOf(output.address) > -1) {
        this.totalPersonalOutputs.ETP += output.value
        if(output.attachment && (output.attachment.type == 'asset-issue' || output.attachment.type == 'asset-transfer')) {
          this.totalPersonalOutputs.MST[output.attachment.symbol] = this.totalPersonalOutputs.MST[output.attachment.symbol] ? this.totalPersonalOutputs.MST[output.attachment.symbol] + output.attachment.quantity : output.attachment.quantity
        }
        output.personal = true
      }
      if(output.attachment.to_did == this.devAvatar)
        this.txFee += output.value

    });

    this.txFee += this.totalInputs.ETP - this.totalOutputs.ETP
    if(this.txFee < 0)
      this.txFee = 0

  }

  depositProgress(start, now, end) {
    return Math.max(1, Math.min(99, Math.round((now - start) / (end - start) * 100)))
  }

}
