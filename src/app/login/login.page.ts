import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    public config: ConfigService,
    public platform: Platform,
    ) { }

  ngOnInit() {
  }

}
