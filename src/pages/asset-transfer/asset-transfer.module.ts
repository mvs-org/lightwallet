import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssetTransferPage } from './asset-transfer';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        AssetTransferPage,
    ],
    imports: [
        IonicPageModule.forChild(AssetTransferPage),
        TranslateModule
    ],
    exports: [
        AssetTransferPage
    ]
})
export class AssetTransferPageModule { }
