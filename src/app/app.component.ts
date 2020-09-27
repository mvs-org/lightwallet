import { Component, NgZone } from '@angular/core'

import { Platform } from '@ionic/angular'
import { SplashScreen } from '@ionic-native/splash-screen/ngx'
import { StatusBar } from '@ionic-native/status-bar/ngx'
import { LanguageService } from './services/language.service'
import { WalletService } from './services/wallet.service'
import { Router } from '@angular/router'
import { Plugins } from '@capacitor/core'
import { AppService } from './services/app.service'

const { App } = Plugins

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
    private walletService: WalletService,
    private router: Router,
    private zone: NgZone,
    public appService: AppService,
  ) {
    this.initializeApp()
  }

  initializeApp() {
    this.platform.ready()
      .then(() => {
        this.initializeLanguage()
        this.initTheme()
        this.statusBar.styleDefault()
        this.splashScreen.hide()
      })
      .then(() => {
        App.addListener('appUrlOpen', (data: any) => {
          this.zone.run(() => {
            const slug = data.url.split('.com').pop()
            if (slug) {
              this.router.navigateByUrl(slug)
              console.log('Slug detected')
              console.log(slug)
            }
            // If no match, do nothing - let regular routing
            // logic take over
          })
        })
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
    const network = await this.appService.getNetwork()
    if (network === 'testnet') {
      document.body.classList.add('testnet')
    }
  }

}
