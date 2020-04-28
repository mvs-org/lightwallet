import { Injectable } from '@angular/core';
import { MetaverseLightwalletCore, MetaverseLightwalletDatabaseIdD, MetaverseLightwalletDatabase } from '../../../../mvs-lightwallet-core';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  core: MetaverseLightwalletCore;

  constructor() { }

  async init(){

    console.log('hallo')

    const db: MetaverseLightwalletDatabase = await MetaverseLightwalletDatabaseIdD.create({name: 'myetpwallet'});

    console.log({db})

    this.core = new MetaverseLightwalletCore(db);


    this.core.db.accounts.activeAccount$().subscribe(account=>console.log('active account', account))
    this.core.balances$().subscribe(balance=>console.log('balance', balance))

  }
}
