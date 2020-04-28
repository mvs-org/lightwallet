import { Injectable } from '@angular/core'
import { Transaction } from './metaverse.service'
import { CoreService } from './core.service'

@Injectable({
  providedIn: 'root',
})
export class DatastoreService {

  constructor(
    private coreService: CoreService,
  ) {
    // this.db = coreService.core.db;
  }

  async transactionCollection() {
    return this.coreService.core.db.transactions;
  }

  async saveTransactions(transactions: Transaction[]) {
    console.log('insert batch', transactions)
    const transactionCollection = await this.transactionCollection()
    for (const tx of transactions) {
      await transactionCollection.atomicUpsert(tx)
    }
    return transactions
  }

  async waitForLeadership() {
    return this.coreService.core.db.waitForLeadership();
  }

  async saveTransaction(transaction: Transaction) {
    console.log('insert ', transaction)
    const collection = await this.transactionCollection()
    const oldTxs = await collection.findOne({ selector:{ hash: transaction.hash } }).exec()
    if (oldTxs) {
      console.log('already exists. updating', transaction.hash)
      return await collection.findOne().where('hash').equals(transaction.hash).update({ $set: transaction })
    } else {
      console.log('add new transaction', transaction)
      return await collection.insert(transaction)
    }
  }

  async getTransactions() {
    const collection = await this.transactionCollection()
    return collection.find().exec().then(txs => txs.map(tx => tx.toJSON()))
  }

  configCollection() {
    return this.coreService.core.db.accounts;
  }


}
