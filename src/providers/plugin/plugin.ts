import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';

export class PluginConfig {
    permissions: Array<string>
}

export class Plugin {
    name: string
    url: string
    config: PluginConfig
    author: string
    repository: string
}

@Injectable()
export class PluginProvider {

    constructor(
        private storage: Storage,
        private http: Http
    ) {
    }

    getPlugins(): Promise<Array<Plugin>> {
        return this.storage.get('plugins')
            .then(plugins => (plugins) ? plugins : [])
    }

    removePlugin(name){
        return this.getPlugins()
            .then(plugins=>{
                let p=[]
                plugins.forEach(plugin=>{
                    if(plugin.name!=name)
                        plugins.push(plugin)
                })
                return this.storage.set('plugins', p)
            })
    }

    fetchPlugin(url) {
        return new Promise(resolve => {
            return this.http.get(url).subscribe(plugin => resolve(plugin.json()), e => {
                throw e.message
            });
        })
    }

    addPlugin(plugin: Plugin) {
        return this.getPlugins()
            .then(plugins => {
                plugins.forEach(p => {
                    if (p.name == plugin.name) throw Error('ERR_PLUGIN_ALREADY_EXISTS')
                })
                plugins.push(plugin)
                return this.storage.set('plugins', plugins)
            })
    }

}
