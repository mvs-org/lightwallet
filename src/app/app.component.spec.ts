import { async, TestBed } from '@angular/core/testing';

import { AppGlobals } from './app.global';
import { ErrorHandler, NgModule } from '@angular/core';
import { WalletServiceProvider } from '../providers/wallet-service/wallet-service';
import { MvsServiceProvider } from '../providers/mvs-service/mvs-service';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';


import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, Http } from '@angular/http';
import { ClipboardModule } from 'ngx-clipboard/dist';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicStorageModule } from '@ionic/storage';
import { QRCodeModule } from 'angular2-qrcode';
import { MyETPWallet } from './app.component';

export function HttpLoaderFactory(http: Http) {
    return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

describe('MyApp Component', () => {
    let fixture;
    let component;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MyApp],
            imports: [
                IonicModule.forRoot(MyApp),
                BrowserModule,
                QRCodeModule,
                HttpModule,
                ClipboardModule,
                IonicModule.forRoot(MyApp),
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
                WalletServiceProvider
            ]
        })
    }));



    beforeEach(() => {
        fixture = TestBed.createComponent(MyApp);
        component = fixture.componentInstance;
    });


    it('should be created', () => {
        expect(component instanceof MyApp).toBe(true);
    });

    it('should have two pages', () => {
      setTimeout(()=>{
          expect(component.pages.length).toBe(true)
      },1000)
    });

});
