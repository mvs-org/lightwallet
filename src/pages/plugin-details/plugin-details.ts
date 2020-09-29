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
        this.alert.showLoading()
            .then(() => this.pluginService.addPlugin(this.plugin))
            .then(() => this.alert.stopLoading())
            .then(() => this.navCtrl.setRoot('AccountPage'))
            .then(() => this.alert.showMessage('MESSAGE.PLUGIN_ADDED_TITLE', '', 'MESSAGE.PLUGIN_ADDED_MESSAGE'))
            .then(() => this.events.publish('settings_update'))
            .catch(error => {
                console.error(error)
                this.alert.stopLoading()
                switch(error.message){
                    case "ERR_DECRYPT_WALLET":
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        break;
                    default:
                        this.alert.showError('IMPORT_PLUGIN.ERROR', error.message)
                        break;
                }
            })
    }

    removePlugin = (name) => {
        this.alert.showLoading()
            .then(() => this.pluginService.removePlugin(name))
            .then(() => this.alert.stopLoading())
            .then(() => this.alert.showMessage('MESSAGE.PLUGIN_REMOVED_TITLE', '', 'MESSAGE.PLUGIN_REMOVED_MESSAGE'))
            .then(()=>this.events.publish('settings_update'))
            .then(()=>this.navCtrl.setRoot('AccountPage'))
            .catch(error => {
                console.error(error)
                this.alert.stopLoading()
                switch(error.message){
                    case "ERR_DECRYPT_WALLET":
                        this.alert.showError('MESSAGE.PASSWORD_WRONG', '')
                        break;
                    default:
                        this.alert.showError('REMOVE_PLUGIN.ERROR', error.message)
                        break;
                }
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
