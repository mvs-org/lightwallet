import { Component, OnInit, ViewChild } from '@angular/core'
import { MetaverseService } from '../../services/metaverse.service'
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material'
import { first } from 'rxjs/operators'

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.page.html',
  styleUrls: [
    './transaction-history.page.scss',
  ],
})
export class TransactionHistoryPage implements OnInit {

  //@ViewChild(MatSort) sort: MatSort
  //@ViewChild(MatPaginator) paginator: MatPaginator

  //transactions = this.metaverse.transactions$
  height$ = this.metaverse.height$
  syncing: boolean
  blocktime: number

  constructor(
    private metaverse: MetaverseService,
  ) {

    this.metaverse.syncing$.subscribe((syncing) => {
      this.syncing = syncing
    })

  }

  dataSource = new MatTableDataSource()

  async ngOnInit() {
    //this.dataSource.sort = this.sort
    //this.dataSource.paginator = this.paginator
    // TODO: Merge transaction arrays for better ux
    const transactionStream = await this.metaverse.transactionStream()
    transactionStream.subscribe(transactions => {
      this.dataSource.data = transactions
    })
    this.height$.subscribe(async (height) => {
      if (height && !this.blocktime) {
        this.blocktime = await this.metaverse.getBlocktime(height)
      }
    })
  }

}
