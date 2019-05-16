import { Component } from '@angular/core';

import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { routerNgProbeToken } from '@angular/router/src/router_module';
import { filter } from 'rxjs/operators';

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
    private translate: TranslateService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.initializeLanguage();
      this.setupSideMenu();
    });
  }

  setupSideMenu(){
      this.router.events.pipe(
        filter(e => e instanceof NavigationEnd)
      ).subscribe((n) => {
        this.menuCtrl.close('sideMenu');
      });
  }

  initializeLanguage() {
    this.translate.setDefaultLang('en');
  }
}
