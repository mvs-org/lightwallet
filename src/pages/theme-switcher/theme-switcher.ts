import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';

export class Themes {
    constructor(public label: string, public key: string) { }
}

@Component({
  selector: 'page-theme-switcher',
  templateUrl: 'theme-switcher.html',
})

export class ThemeSwitcherPage {

    languages: Themes[];

    constructor(public navCtrl: NavController, private event: Events, public navParams: NavParams) {
        this.languages = [
            new Themes('Default', 'default'),
            new Themes('Noctilux', 'noctilux'),
            // new Themes('Cyberpunk', 'cyberpunk'),
            new Themes('Solarized', 'solarized'),
            new Themes('Hello Puppy', 'puppy')
        ]

    }

    select(key) {
        this.event.publish('theme_changed', key)
    }

}
