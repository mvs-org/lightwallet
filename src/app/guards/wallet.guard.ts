import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router'
import { Observable } from 'rxjs'
import { WalletService } from '../services/wallet.service'
import { MultisigService } from '../services/multisig.service'
import { MetaverseService } from '../services/metaverse.service'
import { AccountService } from '../services/account.service'
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class WalletGuard implements CanActivate {
  constructor(
    private wallet: WalletService,
    private multisig: MultisigService,
    private metaverse: MetaverseService,
    private account: AccountService,
    private router: Router,
  ) { }

  canActivate(): Observable<boolean> {
    return this.account.activeAccount$()
      .pipe(map(account => !!account))
  }

  logout() {
    console.log('start clear process')
    Promise.all([
      this.wallet.reset(),
      this.multisig.reset(),
      this.metaverse.reset(),
      this.account.reset(),
    ])
      .then(() => {
        this.router.navigate(['/login'])
      })
  }
}
