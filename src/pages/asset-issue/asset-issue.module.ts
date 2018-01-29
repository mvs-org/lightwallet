import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssetIssuePage } from './asset-issue';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        AssetIssuePage,
    ],
    imports: [
        IonicPageModule.forChild(AssetIssuePage),
        TranslateModule
    ],
    exports: [
        AssetIssuePage
    ]
})
export class AssetIssuePageModule { }
