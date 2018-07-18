import { Component } from '@angular/core';
import { IonicPage, NavController, Events } from 'ionic-angular';
import { PluginProvider, Plugin } from '../../providers/plugin/plugin'
import { AlertProvider } from '../../providers/alert/alert';

@IonicPage()
@Component({
    selector: 'page-plugin-settings',
    templateUrl: 'plugin-settings.html',
})
export class PluginSettingsPage {

    plugins: Array<Plugin>
    loading: boolean = true

    constructor(
        public navCtrl: NavController,
        private events: Events,
        private alert: AlertProvider,
        private pluginService: PluginProvider
    ) {
    }

    addPlugin(url){
        this.pluginService.fetchPlugin(url)
            .then((plugin: Plugin)=> this.navCtrl.push("PluginDetailsPage", {plugin: plugin, installed: false}))
    }

    checkPlugin = (plugin) => {
        this.navCtrl.push("PluginDetailsPage", {plugin: plugin, installed: true})
    }

    removePlugin = (name) => {
        this.pluginService.removePlugin(name)
            .then(()=>this.events.publish('settings_update'))
            .then(()=>this.loadPlugins())
            .catch(error=>{
                    this.alert.showError('Error',error.message)
            })
    }

    loadPlugins(){
        return this.pluginService.getPlugins()
            .then(plugins=>{
                this.plugins=plugins
                this.loading=false
            })
    }

    ionViewDidLoad() {

        this.loadPlugins()

        console.log('ionViewDidLoad PluginSettingsPage');
    }

}
