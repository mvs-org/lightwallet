import { Injectable } from '@angular/core'
import { MetaverseLightwalletCore, MetaverseLightwalletDatabaseIDBPurge, MetaverseLightwalletDatabase } from 'mvs-lightwallet-core'

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  core: MetaverseLightwalletCore

  constructor() { }

  async init() {

    const db: MetaverseLightwalletDatabase = await MetaverseLightwalletDatabaseIDBPurge.create({ name: 'myetpwallet' })

    this.core = new MetaverseLightwalletCore(db)

  }
}
