import { Injectable } from '@angular/core'
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router'
import { Observable } from 'rxjs'
import { MetaverseService } from './services/metaverse.service'

@Injectable({
    providedIn: 'root'
})
export class PublicGuard implements CanActivate, CanActivateChild {

    constructor(
        private metaverseService: MetaverseService,
        private router: Router,
    ) { }

    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Promise<boolean> {
        const addresses = await this.metaverseService.getAddresses()
        if (Array.isArray(addresses) && addresses.length) {
            console.log('existing account detected. redirect to loading')
            this.router.navigate(['/loading'], { state: { data: { reset: true } } })
            return false
        }
        return true
    }

    canActivateChild = this.canActivate

}
