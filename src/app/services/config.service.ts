import { Injectable } from '@angular/core';
import { Network } from '../services/metaverse.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  defaultNetwork: Network = "mainnet";
  version = '0.8.0';

  readonly defaultAddresses = 10;

  isApp: boolean;


  readonly defaultBalances = {
    ETP: { frozen: 0, available: 0, decimals: 8 },
    MST: {
      'PARCELX.GPX': { frozen: 0, available: 0, decimals: 8 },
      'RIGHTBTC.RT': { frozen: 0, available: 0, decimals: 4 },
      'MVS.ZGC': { frozen: 0, available: 0, decimals: 8 },
      'MVS.ZDC': { frozen: 0, available: 0, decimals: 6 },
      SDG: { frozen: 0, available: 0, decimals: 8 },
    },
    MIT: []
  };

  constructor() {
    this.isApp = !document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080');
  }

}
