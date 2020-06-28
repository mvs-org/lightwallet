import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bitident',
  templateUrl: './bitident.page.html',
  styleUrls: ['./bitident.page.scss'],
})
export class BitidentPage implements OnInit {

  isApp = !document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080')
  manualEnterMobile: boolean
  token: string
  leftTime = 0

  constructor(
    private translate: TranslateService,
    private router: Router,
  ) {
  }

  ngOnInit() {
  }

  scan() {
    this.translate.get(['SCANNING.AUTH_MESSAGE']).subscribe((translations: any) => {
      // this.barcodeScanner.scan(
      //     {
      //         preferFrontCamera: false, // iOS and Android
      //         showFlipCameraButton: false, // iOS and Android
      //         showTorchButton: false, // iOS and Android
      //         torchOn: false, // Android, launch with the torch switched on (if available)
      //         prompt: translations['SCANNING.AUTH_MESSAGE'], // Android
      //         resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
      //         formats: "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
      //     }).then((result) => {
      //         if (!result.cancelled) {
      //             this.getLastElement(result.text.toString())
      //         }
      //     })
    })
  }

  getLastElement(token) {
    const target = /(\w+)$/i.test(token) ? /(\w+)$/i.exec(token)[0] : ''
    this.gotoAuthConfirm(target.trim())
  }

  isUrl = (url) => (!/[^A-Za-z0-9@_.-]/g.test(url))

  validAuthToken = (token: string) => (token) ? /(\w+)$/i.test(token) : false;

  gotoAuthConfirm = (token) => this.router.navigate(['account', 'bitident', 'confirm'], { state: { data: { token } } })

  howToAuth = () => this.router.navigate(['account', 'bitident', 'howto'])

}
