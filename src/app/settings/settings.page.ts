import { Component, OnInit } from '@angular/core';
import { WalletService } from '../services/wallet.service';
import { MultisigService } from '../services/multisig.service';
import { MetaverseService } from '../services/metaverse.service';
import { Router } from '@angular/router';
import { WalletGuard } from '../guards/wallet.guard';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(
    private auth: WalletGuard
  ) { }

  ngOnInit() {
  }

  logout(){
    this.auth.logout()
  }

}
