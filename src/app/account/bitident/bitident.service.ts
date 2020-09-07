import { Injectable, } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BitidentService {

  constructor(
    public http: HttpClient
  ) { }

  confirm(url: string, token: string) {
    return this.http.post(url, { token }).toPromise()
      .catch((error) => {
        console.error(error._body)
        throw Error(error._body)
      })
  }
}
