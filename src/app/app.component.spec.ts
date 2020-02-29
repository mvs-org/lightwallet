import { async, TestBed } from '@angular/core/testing';

import { AppGlobals } from './app.global';
import { ErrorHandler, NgModule } from '@angular/core';
import { WalletServiceProvider } from '../providers/wallet-service/wallet-service';
import { MvsServiceProvider } from '../providers/mvs-service/mvs-service';
import { CryptoServiceProvider } from '../providers/crypto-service/crypto-service';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Keyboard } from '@ionic-native/keyboard';
import { Deeplinks } from '@ionic-native/deeplinks';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, Http } from '@angular/http';
import { ClipboardModule } from 'ngx-clipboard/dist';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicStorageModule } from '@ionic/storage';
import { QRCodeModule } from 'angular2-qrcode';
import { MyETPWallet } from './app.component';
import { PluginProvider } from '../providers/plugin/plugin';

export function HttpLoaderFactory(http: Http) {
    return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

describe('MyETPWallet Component', () => {
    let fixture;
    let component;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MyETPWallet],
            imports: [
                IonicModule.forRoot(MyETPWallet),
                BrowserModule,
                QRCodeModule,
                HttpModule,
                ClipboardModule,
                IonicModule.forRoot(MyETPWallet),
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
            providers: [
                AppGlobals,
                { provide: ErrorHandler, useClass: IonicErrorHandler },
                MvsServiceProvider,
                CryptoServiceProvider,
                Keyboard,
                StatusBar,
                SplashScreen,
                PluginProvider,
                WalletServiceProvider,
                Deeplinks,
            ]
        })
    }));



    beforeEach(() => {
        fixture = TestBed.createComponent(MyETPWallet);
        component = fixture.componentInstance;
    });


    it('should be created', () => {
        expect(component instanceof MyETPWallet).toBe(true);
    });

});
