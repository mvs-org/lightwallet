import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { WalletService } from '../services/wallet.service';
import { MultisigService } from '../services/multisig.service';
import { MetaverseService } from '../services/metaverse.service';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class WalletGuard implements CanActivate {
  constructor(
    private storage: Storage,
    private wallet: WalletService,
    private multisig: MultisigService,
    private metaverse: MetaverseService,
    private router: Router,
  ) { }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
    const walletReady = await this.storage.get('wallet') !== undefined;

    if (walletReady) {
      return true;
    }

    this.logout();
    return false;

  }

  logout(){
    console.log('start clear process');
    this.wallet.reset();
    this.multisig.reset();
    this.metaverse.reset();
    this.router.navigate(['login']);
  }
}
