import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class AuthServiceProvider {

    constructor(
        public http: Http
    ) { }

    confirm(url, token) {
        return this.http.post(url, {token: token})
            .catch((error) => {
                console.error(error._body)
                throw Error(error._body)
            })
    }

}
