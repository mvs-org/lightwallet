import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { WalletService } from '../services/wallet.service';
import { MultisigService } from '../services/multisig.service';
import { MetaverseService } from '../services/metaverse.service';

@Injectable({
  providedIn: 'root'
})
export class WalletGuard implements CanActivate {
  constructor(
    private wallet: WalletService,
    private multisig: MultisigService,
    private metaverse: MetaverseService,
    private router: Router,
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const walletReady = this.wallet.addresses$.value.length > 0;

    if (walletReady) {
      return true;
    }

    this.router.navigate(['login']);
    return false;

  }

  logout(){
    console.log('start clear process');
    this.wallet.reset();
    this.multisig.reset();
    this.metaverse.reset();
    this.router.dispose();
    this.router.navigate(['login']);
  }
}
