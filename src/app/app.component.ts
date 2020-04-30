import { Component } from '@angular/core'

import { Platform, MenuController } from '@ionic/angular'
import { SplashScreen } from '@ionic-native/splash-screen/ngx'
import { StatusBar } from '@ionic-native/status-bar/ngx'
import { TranslateService } from '@ngx-translate/core'
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { RouterModule } from '@angular/router'
import { filter } from 'rxjs/operators'
import { LanguageService } from './services/language.service'
import { CoreService } from './services/core.service'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private menuCtrl: MenuController,
    private language: LanguageService,
    private coreService: CoreService,
  ) {
    this.initializeApp()
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault()
      this.splashScreen.hide()
      this.initializeLanguage()
      this.setupSideMenu()
    })

    let currentAccount: any = undefined
    this.coreService.core.db.accounts.activeAccount$().subscribe(account => {
      if (currentAccount === null && account) {
        this.router.navigate(['/account'])
      }
      currentAccount = account
      console.log('active account', account)
    })
    this.coreService.core.balances$().subscribe(balance => console.log('balance', balance))
  }

  setupSideMenu() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((n) => {
      this.menuCtrl.close('sideMenu')
    })
  }

  initializeLanguage() {
    this.language.init()
  }
}
