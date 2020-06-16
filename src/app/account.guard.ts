import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MetaverseService } from './services/metaverse.service';

@Injectable({
    providedIn: 'root'
})
export class AccountGuard implements CanActivate, CanActivateChild {
    constructor(
        private metaverseService: MetaverseService,
        private router: Router,
    ) { }

    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const addresses = await this.metaverseService.getAddresses()
        if (Array.isArray(addresses) && addresses.length)
            return true;
        console.log('account not initialized. redirect to login')
        this.router.navigate(['/'])
        return false;
    }

    canActivateChild = this.canActivate

}
