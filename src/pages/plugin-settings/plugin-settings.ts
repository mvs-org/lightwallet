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
    plugins_names: Array<string>
    plugin_already_added: boolean = false
    loading: boolean = true

    constructor(
        public navCtrl: NavController,
        private events: Events,
        private alert: AlertProvider,
        private pluginService: PluginProvider
    ) {
    }

    addPlugin(url){
        this.plugin_already_added = false
        this.pluginService.fetchPlugin(url)
            .then((plugin: Plugin)=> {
                if(this.plugins_names.indexOf(plugin.name) < 0) {
                    this.navCtrl.push("PluginDetailsPage", {plugin: plugin, installed: false})
                } else {
                    this.plugin_already_added = true
                }
            })
            .catch(error=>{
                    this.alert.showError('Error',error.message)
            })
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
                this.plugins_names=[]
                plugins.forEach(plugin => {
                    this.plugins_names.push(plugin.name)
                })
            })
    }

    ionViewDidLoad() {

        this.loadPlugins()

        console.log('ionViewDidLoad PluginSettingsPage');
    }

}
