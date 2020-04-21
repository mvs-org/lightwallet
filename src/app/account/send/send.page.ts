import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-send',
  templateUrl: './send.page.html',
  styleUrls: ['./send.page.scss'],
})
export class SendPage implements OnInit {

  navLinks = [
    {
      label: 'SEND.SEND_SINGLE',
      path: ['/account', 'send', 'ETP', 'single'],
    },
    {
      label: 'SEND.SEND_MANY',
      path: ['/account', 'send', 'ETP', 'many'],
    },
  ]

  symbol: string

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.activatedRoute.params
      .subscribe(params => {
        this.symbol = params.symbol
      })
  }

}
