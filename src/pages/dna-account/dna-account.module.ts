import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DnaAccountPage } from './dna-account'
import { TranslateModule} from '@ngx-translate/core';
import { DnaCardComponent } from '../../components/dna-card/dna-card';
import { DnaMstCardComponent } from "../../components/dna-mst-card/dna-mst-card";
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        DnaAccountPage,
        DnaCardComponent,
        DnaMstCardComponent,
    ],
    imports: [
        IonicPageModule.forChild(DnaAccountPage),
        PipesModule,
        TranslateModule,
    ],
    providers:[
        AlertProvider
    ],
    exports: [
        DnaAccountPage
    ]
})
export class DnaAccountPageModule { }
