import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssetIssuePage } from './asset-issue';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';
import { ComponentsModule } from '../../components/attenuation-model-selector/attenuation-model-selector.module';

@NgModule({
    declarations: [
        AssetIssuePage,
    ],
    imports: [
        IonicPageModule.forChild(AssetIssuePage),
        PipesModule,
        ComponentsModule,
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
