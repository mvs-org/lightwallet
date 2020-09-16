import { Injectable, ApplicationRef } from '@angular/core'
import { SwUpdate, } from '@angular/service-worker'
import { first, } from 'rxjs/operators'
import { interval, concat } from 'rxjs'
import { ToastService } from './toast.service'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root'
})
export class SwService {

  constructor(
    public appRef: ApplicationRef,
    updates: SwUpdate,
    toastService: ToastService,
    transalte: TranslateService,
  ) {

    // Allow the app to stabilize first, before starting polling for updates with `interval()`.
    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true))
    const everySixHours$ = interval(6 * 60 * 60 * 1000)
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$)

    updates.checkForUpdate()

    everySixHoursOnceAppIsStable$.subscribe(() => updates.checkForUpdate())

    updates.activated.subscribe(event => {
      console.log(`update activated. updated from ${event.previous} to ${event.current}`)
    })

    updates.available.subscribe(async (event) => {
      console.log(`new update available`)
      // TODO ask the user for confirmation
      const [txtUpdateAvailable, txtUpdateApply] = await transalte.get(['UPDATE.AVAILABLE_TEXT', 'UPDATE.APPLY']).toPromise()
      toastService.toastController.create({
        message: txtUpdateAvailable, buttons: [{
          text: txtUpdateApply, handler: () => {
            updates.activateUpdate().then(() => document.location.reload())
          }
        }]
      })
    })
  }

  async unregister() {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      registration.unregister()
    }
  }


}
