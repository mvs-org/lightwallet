import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MvsServiceProvider } from '../../providers/mvs-service/mvs-service'
import { Plugin } from '../../providers/plugin/plugin'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@IonicPage()
@Component({
    selector: 'page-plugin',
    templateUrl: 'plugin.html',
})
export class PluginPage {


    @ViewChild('iframe') iframe: ElementRef;
    plugin: Plugin = new Plugin()
    urlSafe: SafeResourceUrl;

    constructor(
        public navCtrl: NavController,
        private mvs: MvsServiceProvider,
        public sanitizer: DomSanitizer,
        public navParams: NavParams
    ) {
    }

    sendData(data) {
        let doc = this.iframe.nativeElement.contentDocument || this.iframe.nativeElement.contentWindow;

        doc.postMessage({ topic: 'message', value: data }, '*');
    }

    ionViewDidLoad() {
        this.plugin = this.navParams.data.plugin
        if(this.plugin)
        this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.plugin.url);
        window.addEventListener("message", (event) => {
            let source: any = event.source;
            switch (event.data.query) {
                case 'permissions':
                    source.postMessage({
                        topic: 'permissions',
                        value: ['avatars']
                    }, event.origin)
                    break;
                case 'avatars':
                    this.mvs.listAvatars().then(avatars => {
                        source.postMessage({
                            topic: 'avatars',
                            value: avatars
                        }, event.origin)
                    })
            }
        }, false);
        console.log('ionViewDidLoad PluginPage');
    }

}
