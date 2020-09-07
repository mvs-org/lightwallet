import { Component, OnInit } from '@angular/core';
import { AppService } from '../services/app.service'

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  constructor(
    public appService: AppService,
  ) { }

  ngOnInit() {
  }

}
