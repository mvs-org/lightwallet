import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';
import { DatastoreService } from '../../services/datastore.service';
import { Observable } from 'rxjs';

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

  transactions: Observable<any[]>

  constructor(public datastore: DatastoreService) {
    // datastore.transactionCollection().then(collection => {
    //   this.transactions = collection.find().$
    // })
  }

  ngOnInit() {
  }

}
