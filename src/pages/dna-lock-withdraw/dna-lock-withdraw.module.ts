import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DnaLockWithdrawPage } from './dna-lock-withdraw';
import { TranslateModule} from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        DnaLockWithdrawPage
    ],
    imports: [
        IonicPageModule.forChild(DnaLockWithdrawPage),
        PipesModule,
        TranslateModule,
    ],
    providers:[
        AlertProvider
    ],
    exports: [
        DnaLockWithdrawPage
    ]
})
export class DnaLockWithdrawModule { }
