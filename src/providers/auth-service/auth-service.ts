import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class AuthServiceProvider {

    constructor(
        public http: Http
    ) { }

    confirm(url, sig) {
        return this.http.post(url, {signature: sig})
            .catch((error) => {
                console.error(error._body)
                switch(error._body){
                    case "ERR_EXPIRED":
                        throw Error('ERR_EXPIRED')
                    default:
                        throw Error('ERR_AUTH')
                }
            })
    }

}
