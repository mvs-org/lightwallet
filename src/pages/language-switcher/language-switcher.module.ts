import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LanguageSwitcherPage } from './language-switcher';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        LanguageSwitcherPage,
    ],
    imports: [
        IonicPageModule.forChild(LanguageSwitcherPage),
        TranslateModule
    ],
    exports: [
        LanguageSwitcherPage
    ]
})
export class LanguageSwitcherPageModule { }
