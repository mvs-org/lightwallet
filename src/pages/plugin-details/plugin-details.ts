import { Component } from '@angular/core';
import { IonicPage, NavController, Events, NavParams } from 'ionic-angular';
import { PluginProvider, Plugin } from '../../providers/plugin/plugin'
import { AlertProvider } from '../../providers/alert/alert';

@IonicPage()
@Component({
    selector: 'page-plugin-details',
    templateUrl: 'plugin-details.html',
})
export class PluginDetailsPage {

    plugin: Plugin
    installed: boolean

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private events: Events,
        private alert: AlertProvider,
        private pluginService: PluginProvider
    ) {
        this.plugin = navParams.get('plugin')
        this.installed = navParams.get('installed')
    }

    addPlugin(){
        this.pluginService.addPlugin(this.plugin)
            .then(()=>this.navCtrl.setRoot('AccountPage'))
            .then(()=>this.events.publish('settings_update'))
            .catch(error=>{
                    this.alert.showError('Error',error.message)
            })
    }

    removePlugin = (name) => {
        this.pluginService.removePlugin(name)
            .then(()=>this.events.publish('settings_update'))
            .then(()=>this.navCtrl.setRoot('AccountPage'))
            .catch(error=>{
                    this.alert.showError('Error',error.message)
            })
    }

    cancel(e) {
        e.preventDefault()
        this.navCtrl.pop()
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad PluginDetailsPage');
    }

}
