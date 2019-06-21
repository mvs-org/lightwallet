import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-send',
  templateUrl: './send.page.html',
  styleUrls: ['./send.page.scss'],
})
export class SendPage implements OnInit {

  navLinks = [
    {
      label: 'SEND.SEND_SINGLE',
      path: ['/account', 'send', 'single'],
    },
    {
      label: 'SEND.SEND_MANY',
      path: ['/account', 'send', 'many'],
    },
  ]

  activeLinkIndex = 0

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

}
