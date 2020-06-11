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

}
