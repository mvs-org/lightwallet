import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { WalletService } from '../services/wallet.service';
import { MultisigService } from '../services/multisig.service';
import { PluginService } from '../services/plugin.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(
    private storage: Storage,
    private walletService: WalletService,
    private multisig: MultisigService,
    private plugin: PluginService,
  ) { }

  async getSessionAccountInfo() {
    return this.storage.get('account_info')
  }

  async getAccountName() {
    return this.storage.get('account_name') || "Default account"
  }

  setAccountName(account_name) {
    return this.storage.set('account_name', account_name)
  }

  async deleteAccount(account_name) {
    return this.storage.get('saved_accounts')
      .then((accounts) => {
        if (accounts && accounts.length >= 1) {
          accounts.find((o, i) => {
            if (o && o.name === account_name) {
              accounts.splice(i, 1)
              return true; // stop searching
            }
          });
          return this.storage.set('saved_accounts', accounts)
        }
      })
      .catch((error) => {
        console.error(error)
        throw Error('ERR_DELETE_ACCOUNT')
      })
  }


  saveSessionAccount(password) {
    return Promise.all([this.walletService.getSeed(), this.walletService.getWallet(), this.storage.get('multisig_addresses'), this.storage.get('multisigs'), this.storage.get('plugins')])
      .then(([seed, wallet, multisig_addresses, multisigs, plugins]) => {
        let new_account_content = {
          seed: seed,
          wallet: wallet,
          multisig_addresses: multisig_addresses ? multisig_addresses : [],
          multisigs: multisigs ? multisigs : [],
          plugins: plugins ? plugins : []
        }
        return this.walletService.encryptData(JSON.stringify(new_account_content), password)
          .then((content) => this.storage.set('account_info', content))
      })
      .catch((error) => {
        console.error(error)
        throw Error('ERR_SAVE_SESSION_ACCOUNT')
      })
  }

  saveAccount(account_name) {
    return Promise.all([this.getSavedAccounts(), this.getSessionAccountInfo()])
      .then(([saved_accounts, content]) => {
        let old_account_index = -1;
        if (saved_accounts) {
          saved_accounts.find((o, i) => {
            if (o && o.name === account_name) {
              old_account_index = i;
              return true; // stop searching
            }
          });
        }

        let new_account = {
          "name": account_name,
          "content": content,
          "type": "AES"
        }
        old_account_index > -1 ? saved_accounts[old_account_index] = new_account : saved_accounts.push(new_account);
        return this.storage.set('saved_accounts', saved_accounts)
      })
      .catch((error) => {
        console.error(error)
        throw Error('ERR_SAVE_ACCOUNT')
      })
  }

  setupAccount(accountName, decryptedAccount) {
    return Promise.all([this.storage.set('wallet', decryptedAccount.wallet), this.storage.set('seed', decryptedAccount.seed), this.setAccountName(accountName), this.multisig.setMultisigAddresses(decryptedAccount.multisig_addresses), this.multisig.setMultisigInfo(decryptedAccount.multisigs), this.plugin.setPlugins(decryptedAccount.plugins)])
      .catch((error) => {
        console.error(error)
        throw Error('ERR_SETUP_ACCOUNT')
      })
  }

  getSavedAccounts() {
    return this.storage.get('saved_accounts')
      .then((accounts) => {
        return accounts ? accounts : []
      })
  }

  decryptAccount(content, passphrase) {
    return this.walletService.decryptData(content, passphrase)
      .then((decrypted) => {
        return JSON.parse(decrypted.toString())
      })
      .catch((error) => {
        console.error(error)
        throw Error('ERR_DECRYPT_WALLET')
      })
  }

  reset() {
    this.storage.remove('account_info');
    this.storage.remove('account_name');
  }

}
