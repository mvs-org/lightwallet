import { Injectable } from '@angular/core'
import { create, RxDatabase, plugin, RxCollection } from 'rxdb'
import * as idb from 'pouchdb-adapter-idb'
import { Transaction } from './metaverse.service';
import { map } from 'rxjs/operators';
plugin(idb)

@Injectable({
  providedIn: 'root',
})
export class DatastoreService {

  db: Promise<RxDatabase>

  constructor() {

    this.db = create({
      name: 'myetpwallet',
      adapter: 'idb',
      password: '',
      multiInstance: true,
    })
  }

  async transactionCollection() {
    const db = await this.db
    if (db.transaction) {
      return db.transaction
    }
    return db.collection({
      name: 'transaction',
      schema: {
        title: 'transaction',
        version: 0,
        description: 'Metaverse transactions',
        type: 'object',
        properties: {
          hash: {
            type: 'string',
            primary: true,
          },
          inputs: {
            type: 'array',
          },
          outputs: {
            type: 'array',
          },
          lock_time: {
            type: 'integer',
          },
          height: {
            type: 'integer',
            index: true,
          },
          confirmed_at: {
            type: 'integer',
          }
        },
      },
    })
  }

  async saveTransactions(transactions: Transaction[]) {
    console.log('insert ', transactions)
    const transactionCollection = await this.transactionCollection()
    for (const tx of transactions) {
      await this.saveTransaction(tx)
    }
    return transactions
  }

  async saveTransaction(transaction: Transaction) {
    const collection = await this.transactionCollection()
    const oldTx = await collection.findOne({ hash: transaction.hash }).exec()
    if (oldTx) {
      console.log('already exists', oldTx)
    } else {
      return await collection.insert(transaction)
    }
  }

  async getTransactions() {
    const collection = await this.transactionCollection()
    return collection.find().exec().then(txs => txs.map(tx => tx.toJSON()))
  }

  async watchTransactions() {
    const collection = await this.transactionCollection()
    return collection.find().sort({ height: -1 }).$
      .pipe(map(txs => txs.map(tx => tx.toJSON())))
  }

  async clearTransactions() {
    const collection = await this.transactionCollection()
    return collection.find({}).remove()
  }

  async latestTransaction() {
    const collection = await this.transactionCollection()
  }

  async getTransaction(hash: string) {
    const collection = await this.transactionCollection()
    return collection.findOne({ hash }).exec().then(tx => tx.toJSON())
  }


}
