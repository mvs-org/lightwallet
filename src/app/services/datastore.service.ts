import { Injectable } from '@angular/core'
import { create, RxDatabase, plugin, RxCollection } from 'rxdb'
import * as idb from 'pouchdb-adapter-idb'
import { Transaction } from './metaverse.service'
plugin(idb)
import {
  transactionSchema,
  transactionCollectionMethods,
  TransactionCollectionMethods,
  TransactionCollection,
  TransactionDocType,
} from '../store/transaction.datastore'

type MyETPWalletDatabaseCollections = {
  transaction: TransactionCollection
  config: RxCollection<any>
}

@Injectable({
  providedIn: 'root',
})
export class DatastoreService {

  db: Promise<RxDatabase<MyETPWalletDatabaseCollections>>

  transactions: RxCollection<TransactionDocType>
  config: RxCollection<any>

  constructor() {

    this.db = create({
      name: 'myetpwallet',
      adapter: 'idb',
      password: '',
      multiInstance: true,
    })
  }

  async transactionCollection(): Promise<RxCollection<TransactionDocType>> {
    if (this.transactions) {
      return this.transactions
    }
    const db = await this.db
    if (db.transaction) {
      return db.transaction
    }
    return db.collection({
      name: 'transaction',
      schema: transactionSchema,
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
