import { Component } from '@angular/core'

import { Platform } from '@ionic/angular'
import { SplashScreen } from '@ionic-native/splash-screen/ngx'
import { StatusBar } from '@ionic-native/status-bar/ngx'
import { LanguageService } from './services/language.service'
import { SwService } from './services/sw.service'
import { WalletService } from './services/wallet.service'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private language: LanguageService,
    serviceWorker: SwService,
    private walletService: WalletService,
  ) {
    this.initializeApp()
    console.log(serviceWorker.appRef.viewCount)
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.initializeLanguage()
      this.initTheme()
      this.statusBar.styleDefault()
      this.splashScreen.hide()
    })
  }

  async initializeLanguage() {
    this.language.init()
  }

  async initTheme() {
    const localTheme = await this.walletService.getTheme()
    switch (localTheme) {
      case 'dark':
      case 'noctilux':
        document.body.classList.add('dark')
        this.walletService.setTheme('dark')
        break
      case 'light':
      case 'default':
      case 'cyberpunk':
      case 'solarized':
      case 'puppy':
        document.body.classList.remove('dark')
        this.walletService.setTheme('light')
        break
      default:
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
        if (prefersDark.matches) {
          document.body.classList.add('dark')
          this.walletService.setTheme('dark')
        } else {
          document.body.classList.remove('dark')
          this.walletService.setTheme('light')
        }
    }
  }

}
