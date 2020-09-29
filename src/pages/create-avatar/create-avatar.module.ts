import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateAvatarPage } from './create-avatar';
import { TranslateModule } from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        CreateAvatarPage,
    ],
    imports: [
        IonicPageModule.forChild(CreateAvatarPage),
        TranslateModule,
        PipesModule
    ],
    providers: [
        AlertProvider
    ],
    exports: [
        CreateAvatarPage
    ]
})
export class CreateAvatarPageModule { }
