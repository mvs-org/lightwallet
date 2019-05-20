import { Component, OnInit } from '@angular/core';
import { MetaverseService } from '../../services/metaverse.service';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.page.html',
  styleUrls: ['./transaction-history.page.scss'],
})
export class TransactionHistoryPage implements OnInit {

  transactions = this.metaverse.transactions$;

  constructor(
    private metaverse: MetaverseService,
  ) { }

  ngOnInit() {
    this.metaverse.getData();
  }

}
