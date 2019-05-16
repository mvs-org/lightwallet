import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicStorageModule } from '@ionic/storage';

import { IonicModule } from '@ionic/angular';

import { NewsPage } from './news.page';
import { TranslateModule } from '@ngx-translate/core';
import { NewsItemComponent } from './news-item/news-item.component';

const routes: Routes = [
  {
    path: '',
    component: NewsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
  ],
  declarations: [NewsPage, NewsItemComponent],
  exports: [NewsItemComponent]
})
export class NewsPageModule {}
