import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { IonicStorageModule } from '@ionic/storage';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreService } from './services/core.service';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
function appLoadFactory(core: CoreService) {
  return () => core.init();
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    HttpClientModule,
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    BrowserAnimationsModule],
  providers: [
    StatusBar,
    SplashScreen,
    {
      provide: APP_INITIALIZER,
      useFactory: appLoadFactory,
      deps: [CoreService],
      multi: true,
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
  exports:[
  ]
})
export class AppModule { }
