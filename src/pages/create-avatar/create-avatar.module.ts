import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateAvatarPage } from './create-avatar';
import { TranslateModule } from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { FormatPipe } from '../../pipes/format/format';

@NgModule({
    declarations: [
        CreateAvatarPage,
        FormatPipe
    ],
    imports: [
        IonicPageModule.forChild(CreateAvatarPage),
        TranslateModule,
    ],
    providers: [
        AlertProvider
    ],
    exports: [
        CreateAvatarPage
    ]
})
export class CreateAvatarPageModule { }
