import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { QrScannerComponent } from 'angular2-qrscanner';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {

  @ViewChild(QrScannerComponent) qrScannerComponent: QrScannerComponent

  scanSubscription: Subscription
  constructor(
    private router: Router,
    private location: Location,
  ) { }

  ngOnDestroy() {
    if (this.scanSubscription) {
      this.scanSubscription.unsubscribe()
    }
  }

  ngAfterViewInit() {
    console.log({ e: this.qrScannerComponent })
    this.qrScannerComponent.getMediaDevices().then(devices => {
      console.log('devices', devices)
      const videoDevices: MediaDeviceInfo[] = []
      for (const device of devices) {
        if (device.kind.toString() === 'videoinput') {
          videoDevices.push(device)
        }
      }
      if (videoDevices.length > 0) {
        let choosenDev
        for (const dev of videoDevices) {
          if (dev.label.includes('back')) {
            choosenDev = dev
            break
          }
        }
        console.log({ choosenDev })
        if (choosenDev) {
          console.log('found back device')
          // this.qrScannerComponent.chooseCamera.next(choosenDev)
          this.qrScannerComponent.startScanning(choosenDev)
        } else {
          console.log('fallback to first found video device')
          // this.qrScannerComponent.chooseCamera.next()
          this.qrScannerComponent.startScanning(videoDevices[0])
        }
      }
    })
    // this.qrScannerComponent.startScanning(null)


    this.scanSubscription = this.qrScannerComponent.capturedQr.subscribe(result => {
      console.log(result)
    })
  }

  ngOnInit() {

  }

  cancel() {
    this.router.navigate(['/'])
  }

}
