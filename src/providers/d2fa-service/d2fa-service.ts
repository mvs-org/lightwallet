import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class D2faServiceProvider {

    constructor(
        public http: Http
    ) { }

}
