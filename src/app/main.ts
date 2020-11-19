import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

import {enableProdMode} from '@angular/core';
import {DnaUtilWsApiProvider} from "../providers/dna-util-ws-api/dna-util-ws-api";

enableProdMode();

DnaUtilWsApiProvider.init();


platformBrowserDynamic().bootstrapModule(AppModule);
