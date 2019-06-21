import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-send',
  templateUrl: './send.page.html',
  styleUrls: ['./send.page.scss'],
})
export class SendPage implements OnInit {

  navLinks = [
    {
      label: 'SEND.SEND_SINGLE',
      path: './single',
      index: 0,
    },
    {
      label: 'SEND.SEND_MANY',
      path: './many',
      index: 1,
    },
  ]

  // activeLinkIndex = 0

  constructor(private router: Router) { }

  ngOnInit() {
  //   this.router.events.subscribe((res) => {
  //     this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url));
  // })
  }

}
