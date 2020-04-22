import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core'
import { MetaverseService } from '../../services/metaverse.service'
import { MatTableDataSource, } from '@angular/material/table'
import { first } from 'rxjs/operators'
import { Subscription } from 'rxjs'

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
  ) {

    this.metaverse.syncing$.subscribe((syncing) => {
      this.syncing = syncing
    })

  }

  ngOnDestroy(){
    if(this.transactionSubscription){
      this.transactionSubscription.unsubscribe();
    }
  }


  async ngOnInit() {
    //this.dataSource.sort = this.sort
    //this.dataSource.paginator = this.paginator
    // TODO: Merge transaction arrays for better ux
    const transactionCollection = await this.metaverse.transactionCollection()
    const transactions = await (await transactionCollection.find().limit(20).exec()).map(tx=>tx.toJSON())
    this.dataSource.data = transactions
    this.height$.subscribe(async (height) => {
      if (height && !this.blocktime) {
        this.blocktime = await this.metaverse.getBlocktime(height)
      }
    })
  }

}
