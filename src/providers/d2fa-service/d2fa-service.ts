import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class D2faServiceProvider {

    constructor(
        public http: Http
    ) { }

    confirm(url, sig) {
        return this.http.post(url, {signature: sig});
    }

}
