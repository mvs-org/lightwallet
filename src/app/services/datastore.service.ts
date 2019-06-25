import { Injectable } from '@angular/core'
import { create, RxDatabase, plugin, RxCollection } from 'rxdb'
import * as idb from 'pouchdb-adapter-idb'
import { Transaction } from './metaverse.service'
import { map } from 'rxjs/operators'
plugin(idb)

@Injectable({
  providedIn: 'root',
})
export class DatastoreService {

  db: Promise<RxDatabase>

  transactions: RxCollection<Transaction>
  config: RxCollection<any>

  constructor() {

    this.db = create({
      name: 'myetpwallet',
      adapter: 'idb',
      password: '',
      multiInstance: true,
    })
  }

  async transactionCollection() {
    if (this.transactions) {
      return this.transactions
    }
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
          },
        },
      },
    })
  }

  async saveTransactions(transactions: Transaction[]) {
    console.log('insert batch', transactions)
    const transactionCollection = await this.transactionCollection()
    for (const tx of transactions) {
      await this.saveTransaction(tx)
    }
    return transactions
  }

  async waitForLeadership() {
    const db = await this.db
    return db.waitForLeadership()
  }

  async saveTransaction(transaction: Transaction) {
    console.log('insert ', transaction)
    const collection = await this.transactionCollection()
    const oldTxs = await collection.findOne({ hash: transaction.hash }).exec()
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

  async configCollection() {
    if (this.config) {
      return this.config
    }
    const db = await this.db
    if (db.config) {
      return db.config
    }
    return db.collection({
      name: 'config',
      schema: {
        title: 'config',
        version: 0,
        description: 'Metaverse wallet configuration',
        type: 'object',
        properties: {
          key: {
            type: 'string',
            primary: true,
          },
          value: {
            type: ['string', 'integer', 'object', 'array'],
          },
        },
      },
    })
  }


}
