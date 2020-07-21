import { Component } from '@angular/core'

import { Platform } from '@ionic/angular'
import { SplashScreen } from '@ionic-native/splash-screen/ngx'
import { StatusBar } from '@ionic-native/status-bar/ngx'
import { LanguageService } from './services/language.service'
import { SwService } from './services/sw.service'

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
  ) {
    this.initializeApp()
    console.log(serviceWorker.appRef.viewCount)
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.initializeLanguage()
      this.statusBar.styleDefault()
      this.splashScreen.hide()
    })
  }

  async initializeLanguage() {
    this.language.init()
  }

}
