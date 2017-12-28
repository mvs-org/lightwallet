import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule, Http } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';


import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { MyApp } from './app.component';
import { AppGlobals } from './app.global';
import { AccountPage } from '../pages/account/account';
import { ImportWalletPage } from '../pages/import-wallet/import-wallet';
import { ImportWalletMobilePage } from '../pages/import-wallet-mobile/import-wallet-mobile';
import { TransactionsPage } from '../pages/transactions/transactions';
import { AssetTransferPage } from '../pages/asset-transfer/asset-transfer';
import { ReceivePage } from '../pages/receive/receive';
import { LanguageSwitcherPage } from '../pages/language-switcher/language-switcher';
import { ThemeSwitcherPage } from '../pages/theme-switcher/theme-switcher';
import { ImportMnemonicPage } from '../pages/import-mnemonic/import-mnemonic';
import { InformationPage } from '../pages/information/information';
import { DepositPage } from '../pages/deposit/deposit';
import { PassphrasePage } from '../pages/passphrase/passphrase';
import { ExportWalletPage } from '../pages/export-wallet/export-wallet';
import { AssetIssuePage } from '../pages/asset-issue/asset-issue';


import { GenerateKeyPage } from '../pages/generate-key/generate-key';

import { ClipboardModule } from 'ngx-clipboard/dist';
import { QRCodeModule } from 'angular2-qrcode';
import { MvsServiceProvider } from '../providers/mvs-service/mvs-service';
import { WalletServiceProvider } from '../providers/wallet-service/wallet-service';
import { CryptoServiceProvider } from '../providers/crypto-service/crypto-service';

export function HttpLoaderFactory(http: Http) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        MyApp,
        AccountPage,
        DepositPage,
        ImportWalletPage,
        ImportWalletMobilePage,
        LanguageSwitcherPage,
        ThemeSwitcherPage,
        TransactionsPage,
        GenerateKeyPage,
        AssetTransferPage,
        InformationPage,
        ReceivePage,
        PassphrasePage,
        ImportMnemonicPage,
        ExportWalletPage,
        AssetIssuePage
    ],
    imports: [
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
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        AccountPage,
        ImportWalletPage,
        ImportWalletMobilePage,
        LanguageSwitcherPage,
        ThemeSwitcherPage,
        TransactionsPage,
        GenerateKeyPage,
        AssetTransferPage,
        DepositPage,
        InformationPage,
        ReceivePage,
        PassphrasePage,
        ImportMnemonicPage,
        ExportWalletPage,
        AssetIssuePage
    ],
    providers: [
        AppGlobals,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        MvsServiceProvider,
        WalletServiceProvider,
        CryptoServiceProvider,
        BarcodeScanner,
    ]
})
export class AppModule {
    constructor() {
        //console.log(myGlobals.version);
    }
}
