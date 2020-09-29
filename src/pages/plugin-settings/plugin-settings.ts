import { Component } from '@angular/core';
import { IonicPage, NavController, Events } from 'ionic-angular';
import { PluginProvider, Plugin } from '../../providers/plugin/plugin'
import { AlertProvider } from '../../providers/alert/alert';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
    selector: 'page-plugin-settings',
    templateUrl: 'plugin-settings.html',
})
export class PluginSettingsPage {

    plugins: Array<Plugin>
    plugins_names: Array<string>
    plugin_already_added: boolean = false
    error_plugin: boolean = false
    loading: boolean = true

    constructor(
        public navCtrl: NavController,
        private events: Events,
        private alert: AlertProvider,
        private translate: TranslateService,
        private pluginService: PluginProvider
    ) {

    }

    async ionViewDidEnter() {
        let pluginsConfig = await this.pluginService.getPluginsConfig()
        if(!pluginsConfig.hideSettingsWarning) {
            this.alert.showCheckbox('MESSAGE.WARNING_PLUGIN_TITLE', 'MESSAGE.WARNING_PLUGIN_MESSAGE', 'MESSAGE.WARNING_PLUGIN_CHECKBOX_MESSAGE', false, (checked) => {
                if(checked) {
                    pluginsConfig.hideSettingsWarning = true
                    this.pluginService.setPluginsConfig(pluginsConfig)
                }
            })
        }
    }

    addPlugin(url){
        this.alert.showLoading()
        this.plugin_already_added = false
        this.error_plugin = false
        this.pluginService.fetchPlugin(url)
            .then((plugin: Plugin)=> {
                if(this.plugins_names.indexOf(plugin.name) < 0) {
                    this.navCtrl.push("PluginDetailsPage", {plugin: plugin, installed: false})
                } else {
                    this.plugin_already_added = true
                    this.alert.stopLoading()
                }
            })
            .catch((error) => {
                this.error_plugin = true
                console.error(error)
                this.alert.stopLoading()
                switch (error.message) {
                    case 'ERR_INVALID_URL':
                        this.translate.get('MESSAGE.IMPORT_PLUGIN_INVALID_URL').subscribe((message: string) => {
                            this.alert.showError('MESSAGE.IMPORT_PLUGIN_ERROR', message)
                        })
                        break;
                    case 'ERR_INVALID_PLUGIN_FORMAT':
                        this.translate.get('MESSAGE.IMPORT_PLUGIN_INVALID_FORMAT').subscribe((message: string) => {
                            this.alert.showError('MESSAGE.IMPORT_PLUGIN_ERROR', message)
                        })
                        break;
                    case 'ERR_INVALID_PLUGIN_NAME':
                        this.translate.get('MESSAGE.IMPORT_PLUGIN_INVALID_NAME').subscribe((message: string) => {
                            this.alert.showError('MESSAGE.IMPORT_PLUGIN_ERROR', message)
                        })
                        break;
                    case "ERR_MISSING_DEFAULT_TRANSLATION":
                        this.translate.get('MESSAGE.IMPORT_PLUGIN_MISSING_DEFAULT_TRANSLATION').subscribe((message: string) => {
                            this.alert.showError('MESSAGE.IMPORT_PLUGIN_ERROR', message)
                        })
                        break;
                    default:
                        this.alert.showError('MESSAGE.IMPORT_PLUGIN_ERROR', error.message)

                }
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
