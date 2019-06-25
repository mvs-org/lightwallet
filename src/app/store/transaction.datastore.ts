import { RxJsonSchema, RxCollection, RxDocument, RxDocumentTypeWithRev } from 'rxdb'
import { async } from 'q';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TransactionDocType {
    hash: string
    confirmed_at?: number
    inputs: any[]
    outputs: any[]
    height: number
    lock_time?: number
}

export const transactionDocMethods: TransactionDocMethods = {
}

interface TransactionDocMethods {
}

export type TransactionDocument = RxDocument<TransactionDocType, TransactionDocMethods>

export type TransactionCollection = RxCollection<TransactionDocType, TransactionDocMethods, TransactionCollectionMethods>

export interface TransactionCollectionMethods {
    [key: string]: (any) => any
    getTransaction: (string) => Promise<TransactionDocType>
    countAll: () => Promise<number>
    clear: () => Promise<any>
    watch: () => Observable<RxDocumentTypeWithRev<TransactionDocType>[]>
    latest: () => Promise<TransactionDocType>
}

export const transactionCollectionMethods: TransactionCollectionMethods = {
    getTransaction: async function (this: TransactionCollection, hash: string) {
        return await this.findOne().where('hash').equals(hash).exec()
            .then(tx => tx.toJSON())
    },
    countAll: async function (this: TransactionCollection) {
        const allDocs = await this.find().exec()
        return allDocs.length
    },
    watch: function(this: TransactionCollection){
    return this.find().sort({ height: -1 }).$
      .pipe(map(txs => txs.map(tx => tx.toJSON())))
    },
    clear: async function(this: TransactionCollection){
        return this.find({}).remove()
    },
    latest: async function (this: TransactionCollection) {
        const allDocs = await this.find().sort({ height: -1 }).exec()
        return allDocs.length ? allDocs[0].toJSON() : undefined
    },
}

export const transactionSchema: RxJsonSchema<TransactionDocType> = {
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
}
