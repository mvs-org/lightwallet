import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'etp-card',
  templateUrl: './etp-card.component.html',
  styleUrls: ['./etp-card.component.scss'],
})
export class EtpCardComponent {

  @Input() balance: any
    @Input() tickers: any
    @Input() base: string
    @Input() icon: string

    constructor(
        private router: Router,
    ) { }

    gotoTransactions = () => this.router.navigate(['/account', 'history', 'ETP'])

    gotoTransfer = () => this.router.navigate(['/account', 'send', 'ETP'])

    gotoReceive = () => this.router.navigate(['/account', 'recevie', 'ETP'])

}
