import { Component, OnInit } from '@angular/core';
import { MetaverseService } from 'src/app/services/metaverse.service';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.page.html',
  styleUrls: ['./certificates.page.scss'],
})
export class CertificatesPage implements OnInit {

  certificates: any[]
  noCert = false

  constructor(
    private metaverseService: MetaverseService,
  ) { }

  async ngOnInit() {
    this.certificates = await this.metaverseService.listCerts()
    if (this.certificates.length === 0) {
      this.noCert = true
    }
  }

}
