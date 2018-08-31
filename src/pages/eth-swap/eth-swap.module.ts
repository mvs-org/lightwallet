import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EthSwapPage } from './eth-swap';
import { TranslateModule} from '@ngx-translate/core';
import { Keyboard } from '@ionic-native/keyboard';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        EthSwapPage
    ],
    imports: [
        IonicPageModule.forChild(EthSwapPage),
        PipesModule,
        TranslateModule
    ],
    providers:[
        Keyboard,
        AlertProvider
    ],
    exports: [
        EthSwapPage
    ]
})
export class EthSwapPageModule { }
