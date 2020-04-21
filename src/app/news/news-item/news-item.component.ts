import { Component, OnInit, Input } from '@angular/core';
import { News } from 'src/app/services/news.service';

@Component({
  selector: 'news-item',
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.scss'],
})
export class NewsItemComponent implements OnInit {

  @Input() news: News;
  constructor() {
  }

  ngOnInit() {
  }

}
