import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PluginService {

  constructor(
    private storage: Storage,
  ) { }

  setPlugins(plugins: Array<any>) {
    this.storage.set('plugins', plugins ? plugins : [])
  }

}
