import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssetIssuePage } from './asset-issue';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        AssetIssuePage,
    ],
    imports: [
        IonicPageModule.forChild(AssetIssuePage),
        PipesModule,
        TranslateModule
    ],
    providers: [
        AlertProvider
    ],
    exports: [
        AssetIssuePage
    ]
})
export class AssetIssuePageModule { }
