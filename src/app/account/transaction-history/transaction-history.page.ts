import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core'
import { MetaverseService } from '../../services/metaverse.service'
import { MatTableDataSource, } from '@angular/material/table'
import { first } from 'rxjs/operators'
import { Subscription } from 'rxjs'
import { CoreService } from '../../services/core.service'

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.page.html',
  styleUrls: [
    './transaction-history.page.scss',
  ],
})
export class TransactionHistoryPage implements OnInit, OnDestroy {

  //@ViewChild(MatSort) sort: MatSort
  //@ViewChild(MatPaginator) paginator: MatPaginator

  //transactions = this.metaverse.transactions$
  height$ = this.metaverse.height$
  syncing: boolean
  blocktime: number
  transactionSubscription: Subscription;
  dataSource = new MatTableDataSource()

  constructor(
    private metaverse: MetaverseService,
    private coreService: CoreService,
  ) {

    this.metaverse.syncing$.subscribe((syncing) => {
      this.syncing = syncing
    })

  }

  ngOnDestroy() {
    if (this.transactionSubscription) {
      this.transactionSubscription.unsubscribe();
    }
  }


  async ngOnInit() {
    //this.dataSource.sort = this.sort
    //this.dataSource.paginator = this.paginator
    // TODO: Merge transaction arrays for better ux
    // const transactionCollection = await this.metaverse.transactionCollection()
    this.dataSource.data = await (await this.coreService.core.db.transactions.find().sort({ height: 'desc' }).limit(20).exec()).map(tx => tx.toJSON());
      this.height$.subscribe(async (height) => {
        if (height && !this.blocktime) {
          this.blocktime = await this.metaverse.getBlocktime(height)
        }
      })
  }

}
