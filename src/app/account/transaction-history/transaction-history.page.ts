import { Component, OnInit } from '@angular/core';
import { MetaverseService } from '../../services/metaverse.service';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.page.html',
  styleUrls: ['./transaction-history.page.scss'],
})
export class TransactionHistoryPage implements OnInit {

  transactions = this.metaverse.transactions$;
  height$ = this.metaverse.height$;
  syncing: boolean;

  constructor(
    private metaverse: MetaverseService,
  ) { 
    this.metaverse.syncing$.subscribe((syncing) => {
      this.syncing = syncing;
    });
  }

  ngOnInit() {
    this.metaverse.sync();
  }

}
