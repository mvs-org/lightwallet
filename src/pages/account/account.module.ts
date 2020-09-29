import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccountPage } from './account'
import { TranslateModule} from '@ngx-translate/core';
import { EtpCardComponent } from '../../components/etp-card/etp-card';
import { MSTCardComponent } from '../../components/mst-card/mst-card';
import { MITCardComponent } from '../../components/mit-card/mit-card';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        AccountPage,
        EtpCardComponent,
        MSTCardComponent,
        MITCardComponent
    ],
    imports: [
        IonicPageModule.forChild(AccountPage),
        PipesModule,
        TranslateModule,
    ],
    providers:[
        AlertProvider
    ],
    exports: [
        AccountPage
    ]
})
export class AccountPageModule { }
