import { Component, OnInit, Input } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-vote-item',
  templateUrl: './vote-item.component.html',
  styleUrls: ['./vote-item.component.scss'],
})
export class VoteItemComponent implements OnInit {

  @Input() output: any
  @Input() height: number
  @Input() blocktime: number
  @Input() icon: string
  @Input() reward: string

  current_time: number

  constructor(
    public appService: AppService,
    public walletService: WalletService,
  ) {
    this.current_time = Date.now()
  }

  ngOnInit() { }

  explorerURL = (tx) => (this.appService.network === 'mainnet') ? 'https://explorer.mvs.org/tx/' + tx : 'https://explorer-testnet.mvs.org/tx/' + tx

  depositProgress(start, end) {
    return Math.max(0.01, Math.min(0.99, Math.round((this.height - start) / (end - start) * 100) / 100))
  }

  checkTx = () => this.walletService.openLink(this.explorerURL(this.output.hash))

}
