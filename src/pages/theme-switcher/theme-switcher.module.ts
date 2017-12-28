import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ThemeSwitcherPage } from './theme-switcher';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        ThemeSwitcherPage,
    ],
    imports: [
        IonicPageModule.forChild(ThemeSwitcherPage),
        TranslateModule
    ],
    exports: [
        ThemeSwitcherPage
    ]
})
export class ThemeSwitcherPageModule { }
