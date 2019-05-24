import { Component, OnInit } from '@angular/core';
import { WalletService } from '../services/wallet.service';
import { MultisigService } from '../services/multisig.service';
import { MetaverseService } from '../services/metaverse.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(
    private wallet: WalletService,
    private multisig: MultisigService,
    private metaverse: MetaverseService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  logout(){
    this.wallet.reset();
    this.multisig.reset();
    this.metaverse.reset();
    this.router.dispose();
    this.router.navigate(['login']);
  }

}
