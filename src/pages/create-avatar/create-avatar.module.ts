import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateAvatarPage } from './create-avatar';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        CreateAvatarPage,
    ],
    imports: [
        IonicPageModule.forChild(CreateAvatarPage),
        TranslateModule,
    ],
})
export class CreateAvatarPageModule { }
