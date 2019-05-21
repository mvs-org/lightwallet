import { Injectable } from '@angular/core';
import Metaverse from 'metaversejs/dist/metaverse.js';
import { ConfigService } from './config.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { flatMap, first } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { WalletService } from './wallet.service';
import { MultisigService } from './multisig.service';
import { Storage } from '@ionic/storage';
import Blockchain from 'mvs-blockchain/dist/index';

export interface Transaction {
  height: number;
  hash: string;
}

export interface Balance {
  frozen: number;
  available: number;
  decimals: number;
}

export interface Balances {
  ETP: Balance;
  MST: {
    [symbol: string]: Balance
  };
  MIT: any[];
}

export type Network = "mainnet" | "testnet";

@Injectable({
  providedIn: 'root'
})
export class MetaverseService {

  syncing = new Subject<boolean>();
  transactions$ = new BehaviorSubject<Transaction[]>([]);
  height$ = new BehaviorSubject<number>(0);

  readonly network = this.config.defaultNetwork;

  blockchain: any;

  constructor(
    private config: ConfigService,
    private storage: Storage,
    private wallet: WalletService,
    private multisig: MultisigService,
  ) {
    this.setNetwork(this.config.defaultNetwork)
    this.restoreTransactions().then(txs => this.transactions$.next(txs));
  }

  setNetwork(network: Network) {
    this.blockchain = Blockchain({ network: this.network });
  }

  utxos$ = (addresses$: Observable<string[]>) => combineLatest([
    this.transactions$,
    addresses$,
  ]).pipe(
    flatMap(([transactions, addresses]) => Metaverse.output.calculateUtxo(transactions, addresses))
  )

  async getData(): Promise<any> {
    this.syncing.next(true);
    const addresses = await this.wallet.getAddresses();
    addresses.concat(await this.multisig.getMultisigAddresses());
    let newTxs = await this.getNewTxs(addresses, await this.getLastTxHeight());
    const newTransactionsFound = newTxs && newTxs.length;
    while (newTxs && newTxs.length) {
      newTxs = await this.getNewTxs(addresses, await this.getLastTxHeight());
      this.transactions$.next(await this.restoreTransactions());
    }
    if (newTransactionsFound) {
      this.transactions$.next(await this.restoreTransactions());
    }
  }

  async getLastTxHeight() {
    const transactions = await (this.transactions$.pipe(first())).toPromise();
    if (!transactions || transactions.length === 0) {
      return 0;
    }
    return transactions[0].height;
  }

  async getNewTxs(addresses: Array<string>, lastKnownHeight: number): Promise<any> {
    const newTxs = await this.loadNewTxs(addresses, lastKnownHeight + 1);
    return this.storeTransactions(newTxs);
  }

  loadNewTxs(addresses: Array<string>, start: number) {
    return this.blockchain.addresses.listTxs(addresses, { min_height: start })
      .catch((error: Error) => {
        console.log('error loading transactions');
        throw Error('ERR_SYNC_NEW_TRANSACTIONS');
      });
  }

  async storeTransactions(newtxs: Array<any>) {
    if (newtxs === undefined || newtxs.length === 0) {
      return newtxs;
    }
    let txs = await this.restoreTransactions();
    newtxs = newtxs.sort((a: any, b: any) => a.height - b.height);
    newtxs.forEach((newtx) => {
      const found = this.findTxIndexByHash(txs, newtx.hash);
      if (found === -1) {
        txs = [newtx].concat(txs);
      } else {
        txs[found] = newtx;
      }
    });
    await this.storage.set('mvs_txs', txs);
    return newtxs;
  }

  private findTxIndexByHash(txs: Transaction[], hash: string) {
    txs.forEach((tx, index) => {
      if (tx.hash === hash) {
        return index;
      }
    });
    return -1;
  }

  async restoreTransactions() {
    return await this.storage.get('mvs_txs') || [];
  }

  public sortByTransactionHeight(a: Transaction, b: Transaction) {
    return b.height - a.height;
  }

  getTickers = () => this.blockchain.pricing.tickers();

}
