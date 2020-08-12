import { Injectable, OnInit } from '@angular/core'
import { AlertService } from './alert.service'
import { WalletService } from 'src/app/services/wallet.service'
import { TranslateService } from '@ngx-translate/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  hasSeed: boolean
  savedAccountsName: any = []

  constructor(
    private alertService: AlertService,
    private walletService: WalletService,
    private translate: TranslateService,
    private metaverseService: MetaverseService,
    private router: Router,
  ) { }

  async init() {
    this.hasSeed = await this.walletService.hasSeed()
    const accounts = await this.walletService.getSavedAccounts()
    this.savedAccountsName = (accounts && accounts.length >= 1) ? accounts.map(account => account.name) : []

  }

  async logout() {
    const accountInfo = await this.walletService.getSessionAccountInfo()
    if (accountInfo || !this.hasSeed) {
      this.saveAccount()
    } else {
      this.showLogoutNoAccount()
    }
  }

  /*async showLogout() {
    const choice = await this.alertService.alertTripleChoice(
      'LOGOUT.CONFIRMATION.TITLE',
      'LOGOUT.CONFIRMATION.SUBTITLE',
      'LOGOUT.CONFIRMATION.CANCEL',
      'LOGOUT.CONFIRMATION.FORGET',
      'LOGOUT.CONFIRMATION.SAVE'
    )
    switch (choice) {
      case 'option1':
        return this.forgetAccount()
      case 'option2':
        return this.saveAccount()
      case 'cancel':
      default:
        break
    }
  }*/

  async forgetAccount() {
    const accountName = await this.walletService.getAccountName()
    await this.walletService.deleteAccount(accountName)
    await this.metaverseService.hardReset()
    this.router.navigate(['login'])
  }

  async saveAccount() {
    const currentUsername = await this.walletService.getAccountName()
    if (currentUsername) {
      this.save(currentUsername)
    } else {
      this.newUsername('LOGOUT.SAVE_NEW_USER.TITLE', 'LOGOUT.SAVE_NEW_USER.SUBTITLE', 'LOGOUT.SAVE_NEW_USER.PLACEHOLDER')
    }
  }

  async newUsername(title, message, placeholder) {
    const result = await this.alertService.alertTripleChoiceAndInput(title, message, 'LOGOUT.CONFIRMATION.CANCEL', 'LOGOUT.CONFIRMATION.FORGET', 'LOGOUT.CONFIRMATION.SAVE', placeholder, 'text')
    if (result) {
      switch (result.choice) {
        case 'option1':
          this.forgetAccount()
          break
        case 'option2':
          const username = result.input
          if (!username) {
            this.newUsername('LOGOUT.SAVE_ACCOUNT_NO_NAME.TITLE', 'LOGOUT.SAVE_ACCOUNT_NO_NAME.SUBTITLE', placeholder)
          } else if (this.savedAccountsName.indexOf(username) !== -1) {
            this.newUsername('LOGOUT.SAVE_ACCOUNT_ALREADY_EXIST.TITLE', 'LOGOUT.SAVE_ACCOUNT_ALREADY_EXIST.SUBTITLE', placeholder)
          } else {
            this.save(username)
          }
          break
        default:
          return
      }
    }
  }

  async save(username) {
    try {
      await this.walletService.saveAccount(username)
      await this.metaverseService.hardReset()
      await this.router.navigate(['login'])
    } catch (error) {
      this.alertService.showError('ERROR.SAVE_ACCOUNT', error.message)
    }
  }

  async showLogoutNoAccount() {
    const confirm = await this.alertService.alertConfirm(
      'LOGOUT.CONFIRMATION_NO_ACCOUNT.TITLE',
      'LOGOUT.CONFIRMATION_NO_ACCOUNT.SUBTITLE',
      'LOGOUT.CONFIRMATION_NO_ACCOUNT.CANCEL',
      'LOGOUT.CONFIRMATION_NO_ACCOUNT.OK'
    )
    if (confirm) {
      await this.metaverseService.hardReset()
      this.router.navigate(['login'])
    }
  }

}
