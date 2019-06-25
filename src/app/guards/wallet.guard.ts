import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router'
import { Observable } from 'rxjs'
import { WalletService } from '../services/wallet.service'
import { MultisigService } from '../services/multisig.service'
import { MetaverseService } from '../services/metaverse.service'
import { AccountService } from '../services/account.service'
import { Storage } from '@ionic/storage'
import { DatastoreService } from '../services/datastore.service'
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class WalletGuard implements CanActivate {
  constructor(
    private storage: Storage,
    private wallet: WalletService,
    private multisig: MultisigService,
    private metaverse: MetaverseService,
    private account: AccountService,
    private router: Router,
    private dataStore: DatastoreService,
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      this.wallet.addresses$()
        .then(collection => {
          return collection.subscribe((addresses => {
            if (addresses && addresses.length > 0) {
              subscriber.next(true)
            } else {
              this.logout()
              subscriber.next(false)
            }
          }))
        })
    })
  }

  logout() {
    console.log('start clear process')
    this.wallet.reset()
    this.multisig.reset()
    this.metaverse.reset()
    this.account.reset()
    this.router.navigate(['/login'])
  }
}
