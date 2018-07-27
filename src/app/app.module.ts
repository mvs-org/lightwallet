import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule, Http } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MyETPWallet } from './app.component';
import { AppGlobals } from './app.global';
import { MvsServiceProvider } from '../providers/mvs-service/mvs-service';
import { WalletServiceProvider } from '../providers/wallet-service/wallet-service';
import { CryptoServiceProvider } from '../providers/crypto-service/crypto-service';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Keyboard } from '@ionic-native/keyboard';
import { PluginProvider } from '../providers/plugin/plugin';

var pckg = require('../../package.json');

export function HttpLoaderFactory(http: Http) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json?v=' + pckg.version);
}

@NgModule({
    declarations: [
        MyETPWallet
    ],
    imports: [
        BrowserModule,
        HttpModule,
        IonicModule.forRoot(MyETPWallet, { scrollAssist: false }),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (HttpLoaderFactory),
                deps: [Http]
            }
        }),
        IonicStorageModule.forRoot({
            name: '__myetpwallet',
            driverOrder: ['indexeddb', 'localstorage']
        })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyETPWallet
    ],
    providers: [
        AppGlobals,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        MvsServiceProvider,
        SplashScreen,
        WalletServiceProvider,
        CryptoServiceProvider,
        StatusBar,
        Keyboard,
        PluginProvider,
    ]
})
export class AppModule {
    constructor() {
    }
}
