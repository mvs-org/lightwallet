import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule, Http } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { MyApp } from './app.component';
import { AppGlobals } from './app.global';
import { ImportWalletPage } from '../pages/import-wallet/import-wallet';
import { TransactionsPage } from '../pages/transactions/transactions';
import { AssetTransferPage } from '../pages/asset-transfer/asset-transfer';
import { ReceivePage } from '../pages/receive/receive';
import { ImportMnemonicPage } from '../pages/import-mnemonic/import-mnemonic';
import { PassphrasePage } from '../pages/passphrase/passphrase';
import { ExportWalletPage } from '../pages/export-wallet/export-wallet';
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
        ImportWalletPage,
        TransactionsPage,
        GenerateKeyPage,
        AssetTransferPage,
        ReceivePage,
        PassphrasePage,
        ImportMnemonicPage,
        ExportWalletPage,
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
        ImportWalletPage,
        TransactionsPage,
        GenerateKeyPage,
        AssetTransferPage,
        ReceivePage,
        PassphrasePage,
        ImportMnemonicPage,
        ExportWalletPage,
    ],
    providers: [
        AppGlobals,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        MvsServiceProvider,
        WalletServiceProvider,
        CryptoServiceProvider,
    ]
})
export class AppModule {
    constructor() {
    }
}
