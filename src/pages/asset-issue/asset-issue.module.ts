import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssetIssuePage } from './asset-issue';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';
import { AttenuationModelModule } from '../../components/attenuation-model-selector/attenuation-model-selector.module';
import { MiningModelModule } from '../../components/mining-model-selector/mining-model-selector.module';

@NgModule({
    declarations: [
        AssetIssuePage,
    ],
    imports: [
        IonicPageModule.forChild(AssetIssuePage),
        PipesModule,
        AttenuationModelModule,
        MiningModelModule,
        TranslateModule,
    ],
    providers: [
        AlertProvider,
    ],
    exports: [
        AssetIssuePage,
    ]
})
export class AssetIssuePageModule { }
