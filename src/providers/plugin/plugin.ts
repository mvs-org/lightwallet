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
    translation: any
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

    removePlugin(name) {
        return this.getPlugins()
            .then(plugins => {
                let p = []
                plugins.forEach(plugin => {
                    if (plugin.name != name)
                        p.push(plugin)
                })
                return this.storage.set('plugins', p)
            })
    }

    fetchPlugin(url) {
        return new Promise(resolve => {
            return this.http.get(url).subscribe(plugin => {
                try {
                    resolve(plugin.json())
                } catch(e) {
                    resolve(null)
                }
            });
        })
        .then((plugin: Plugin) => {
            if (plugin == null)
                throw Error("ERR_INVALID_URL")
            if (!/^[a-z-]*$/.test(plugin.name))
                throw Error("ERR_INVALID_PLUGIN_NAME")
            if (plugin.translation == undefined || plugin.translation.default == undefined || plugin.translation.default.name == undefined)
                throw Error("ERR_MISSING_DEFAULT_TRANSLATION")
            return plugin
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
