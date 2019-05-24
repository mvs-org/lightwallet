import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { Platform } from '@ionic/angular';
import { MetaverseService, Network } from '../services/metaverse.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  network: Network

  constructor(
    public config: ConfigService,
    public metaverse: MetaverseService,
    public platform: Platform,
    ) { }

  ngOnInit() {
    this.network = this.metaverse.network
  }

}
