import { Component, OnInit } from '@angular/core';
import { LogoutService } from '../services/logout.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(
    private logoutService: LogoutService,
  ) { }

  ngOnInit() {
  }

  /**
   * Logout dialog
   */
  logout() {
    this.logoutService.logout()
  }

}
