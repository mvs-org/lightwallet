import { Component, OnInit } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.page.html',
  styleUrls: ['./avatar.page.scss'],
})
export class AvatarPage implements OnInit {

  avatars: Array<any>
  certs: Array<any>
  no_avatar = false

  constructor(
    public mvs: MetaverseService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loadAvatars()
      .then(() => this.loadCerts())
      .catch(console.error)
  }

  createAsset(avatar_name: string, avatar_address: string) {
    // this.navCtrl.push("AssetIssuePage", { avatar_name: avatar_name, avatar_address: avatar_address })
    this.router.navigate(['account', 'mst', 'create'])
  }

  registerMIT(avatar_name: string, avatar_address: string) {
    // this.navCtrl.push("MITRegisterPage", { avatar_name: avatar_name, avatar_address: avatar_address })
    this.router.navigate(['account', 'mit', 'create'])
  }

  loadAvatars() {
    return this.mvs.listAvatars()
      .then((avatars) => {
        this.avatars = avatars
        if (this.avatars.length === 0) {
          this.no_avatar = true
        }
      })
  }

  loadCerts() {
    return this.mvs.listCerts()
      .then((certs) => {
        this.certs = certs
        certs.forEach(cert => {
          this.avatars.forEach(avatar => {
            if (avatar.certs === undefined) {
              avatar.certs = []
            }
            if (avatar.address === cert.address) {
              avatar.certs.push({
                cert_type: cert.attachment.cert,
                symbol: cert.attachment.symbol
              })
            }
          })
        })
      })
  }

}
