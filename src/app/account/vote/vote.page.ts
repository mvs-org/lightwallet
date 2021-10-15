import { Component, OnInit } from '@angular/core'
import { MetaverseService } from 'src/app/services/metaverse.service'
import { WalletService } from 'src/app/services/wallet.service'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-vote',
  templateUrl: './vote.page.html',
  styleUrls: ['./vote.page.scss'],
})
export class VotePage implements OnInit {

  blocktime: number
  selectedAsset: string
  frozen_outputs_locked = []
  frozen_outputs_unlocked = []
  availableUtxos = {}
  rewards = {}
  height: number
  decimals = 4

  constructor(
    private activatedRoute: ActivatedRoute,
    private metaverseService: MetaverseService,
    public walletService: WalletService,
  ) {
    this.selectedAsset = this.activatedRoute.snapshot.params.symbol
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.metaverseService.getHeight()
      .then(height => {
        this.height = height
        return Promise.all([this.getBlocktime(height), this.calculateFrozenOutputs(height)])
      })
  }

  getBlocktime(height) {
    return this.metaverseService.getBlocktime(height)
      .then(blocktime => {
        this.blocktime = blocktime
      })
      .catch((error) => {
        console.error(error.message)
      })
  }

  checkElection = () => this.walletService.openLink('https://' + this.electionURL())

  electionURL = () => 'www.dnavote.com'

  openLink = (link) => this.walletService.openLink(link)

  async calculateFrozenOutputs(height) {
    const outputs = await this.metaverseService.getFrozenOutputs(this.selectedAsset)
    const txs = await this.metaverseService.getTransactionMap()
    this.frozen_outputs_locked = []
    this.frozen_outputs_unlocked = []
    let frozen_outputs_locked_hash = []
    let frozen_outputs_unlocked_hash = []
    outputs.forEach((locked_output) => {
      const tx = txs[locked_output.hash]
      for (let i = 0; i < tx.outputs.length; i++) {
        const output = tx.outputs[i]
        if (output.attachment.type === 'message' && /^vote_([a-z0-9]+)\:([A-Za-z0-9-_@\.]+)$/.test(output.attachment.content)) {
          locked_output.voteType = /^vote_([a-z0-9]+)\:/.test(output.attachment.content) ? output.attachment.content.match(/^vote_([a-z0-9]+)\:/)[1] : 'Invalid Type'
          locked_output.voteAvatar = /\:([A-Za-z0-9-_@\.]+)$/.test(output.attachment.content) ? output.attachment.content.match(/\:([A-Za-z0-9-_@\.]+)$/)[1] : 'Invalid Avatar'
        }
      }

      if (height > locked_output.locked_until) {
        this.frozen_outputs_unlocked.push(locked_output)
        frozen_outputs_unlocked_hash.push(locked_output.hash)
      } else {
        this.frozen_outputs_locked.push(locked_output)
        frozen_outputs_locked_hash.push(locked_output.hash)
      }
    })
    let frozen_rewards_locked_result = frozen_outputs_locked_hash && frozen_outputs_locked_hash.length > 0
      ? await this.walletService.getElectionRewards(frozen_outputs_locked_hash) : undefined
    let rewards = frozen_rewards_locked_result && frozen_rewards_locked_result.result ? frozen_rewards_locked_result.result : []

    let frozen_rewards_unlocked_result = await this.walletService.getElectionRewards(frozen_outputs_unlocked_hash)
    rewards = rewards.concat(frozen_rewards_unlocked_result ? frozen_rewards_unlocked_result.result : [])

    //TO DELETE
    /*let test = await this.wallet.getElectionRewards(['5dd276da9f2ab08bdef125911504307336e4f5e4fecba399facd08f71e719778'])
    rewards = rewards.concat(test.json().result)
    console.log(rewards)
    this.rewards['2da3140d7b491b7c4165763c93f2a3c246faa6d2663652e84976547a0c748996'] = 1000
    */
    //UNTIL HERE

    if (rewards) {
      rewards.forEach(reward => {
        this.rewards[reward.txid] = reward.reward
      })
    }

  }

}
