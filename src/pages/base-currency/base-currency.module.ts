import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BaseCurrencyPage } from './base-currency';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        BaseCurrencyPage,
    ],
    imports: [
        IonicPageModule.forChild(BaseCurrencyPage),
        TranslateModule,
    ],
})
export class BaseCurrencyPageModule { }
