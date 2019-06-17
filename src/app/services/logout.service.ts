import { Injectable } from '@angular/core';
import { AccountService } from '../services/account.service';
import { WalletGuard } from '../guards/wallet.guard';
import { AlertService } from '../services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  saved_accounts_name: any = [];

  constructor(
    private accountService: AccountService,
    private auth: WalletGuard,
    private alertService: AlertService,
  ) { 

    this.accountService.getSavedAccounts()
    .then((accounts) => this.saved_accounts_name = (accounts && accounts.length >= 1) ? accounts.map(account => account.name) : [])

  }

    /**
   * Logout dialog
   */
  logout() {
    this.accountService.getSessionAccountInfo()
      .then((account_info) => {
        if (account_info) {
          //Already has an account
          this.alertShowLogout()
        } else {
          //No account yet
          this.auth.logout()
        }
      })
  }

  private forgetAccountHandler = () => {
    return this.accountService.getAccountName()
      .then((account_name) => this.accountService.deleteAccount(account_name))
      .then(() => this.auth.logout())
  }

  private saveAccountHandler = () => {
    return this.accountService.getAccountName()
      .then((current_username) => {
        if (current_username) {
          this.saveAccount(current_username);
        } else {
          this.alertAskUsername('TITLE_DEFAULT', 'TEXT_DEFAULT')
        }
      })
  }

  saveAccount(username) {
    this.accountService.saveAccount(username)
      .then(() => this.auth.logout())
      .catch((error) => {
        //this.alert.showError('MESSAGE.ERR_SAVE_ACCOUNT', error.message)
      })
  }

  async alertShowLogout() {
    const alert = await this.alertService.alert('ACCOUNT_MANAGEMENT', 'LOGOUT', 'TITLE', 'TEXT', ['SAVE', 'FORGET', 'BACK'])

    alert.onDidDismiss().then((data) => {
      switch (data.data) {
        case 'SAVE':
          this.saveAccountHandler()
          return
        case 'FORGET':
          this.forgetAccountHandler()
          return
        default:
          return
      }
    })
  }

  async alertAskUsername(title, text) {
    const alert = await this.alertService.alertInput('ACCOUNT_MANAGEMENT', 'LOGOUT_ASK_USERNAME', title, text)

    alert.onDidDismiss().then((data) => {
      if (data.data)
        this.checkUsername(data.data)
    })
  }

  checkUsername(username) {
    if (!username) {
      this.alertAskUsername('TITLE_NO_NAME', 'TEXT_NO_NAME')
    } else if (this.saved_accounts_name.indexOf(username) != -1) {
      this.alertAskUsername('TITLE_ALREADY_EXIST', 'TEXT_ALREADY_EXIST')
    } else {
      this.saveAccount(username);
    }
  }

}
