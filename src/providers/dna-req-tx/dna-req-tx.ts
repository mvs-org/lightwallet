import { Injectable } from '@angular/core'
import { ops, TransactionHelper, Aes, TransactionBuilder } from "bitsharesjs";
import { DnaUtilWsApiProvider } from "../dna-util-ws-api/dna-util-ws-api";
import { DnaUtilUtilProvider } from "../dna-util-util/dna-util-util";

let DATA  = require('../../data/data.js').default;

// 全部的网络请求
@Injectable()
export class DnaReqTxProvider {

    //send BTS:transfer("zhiguang1111", "zhiguang2222", { amount: 100000, asset: "DNA" }, memo);
    static async transferDNA(pKey, fromAccount, toAccount, sendAmount, memo, estFee = false) {
        //console.log(pKey.toWif());
        let instance = await DnaUtilWsApiProvider.instance(true, true);

        let accounts = await instance.db_api().exec('get_accounts', [[fromAccount, toAccount], false]);
        fromAccount = accounts.find(it => it.name == fromAccount);
        toAccount = accounts.find(it => it.name == toAccount);
        let memoFromKey = fromAccount.options.memo_key;
        let memoToKey = toAccount.options.memo_key;
        let assets = await instance.db_api().exec('get_assets', [[sendAmount.asset, DATA.TOKEN_SYMBOL], false]);
        let sendAsset = assets.find(it => it.symbol == sendAmount.asset);
        let coreAsset = assets.find(it => it.symbol == DATA.TOKEN_SYMBOL);


        let tr = new TransactionBuilder();
        let transferObj = {
            fee: {
                amount: 0,
                asset_id: coreAsset.id
            },
            from: fromAccount.id,
            to: toAccount.id,
            amount: { amount: sendAmount.amount, asset_id: sendAsset.id }
        };

        if (memo) {
            let nonce = TransactionHelper.unique_nonce_uint64();
            transferObj['memo'] = {
                from: memoFromKey,
                to: memoToKey,
                nonce,
                message: Aes.encrypt_with_checksum(
                    pKey,
                    memoToKey,
                    nonce,
                    memo
                )
            }
        }
        tr.add_type_operation("transfer", transferObj)

        await tr.set_required_fees();
        if (estFee) {
            return tr;
        }
        tr.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());

        let result = await this.processTranscation(tr)
        console.log("transfer result:");
        console.log(result);
        return result;
    }

    static async voteForWitness(pKey, account, voteWitnesses, new_proxy_id) {
        let instance = await DnaUtilWsApiProvider.instance(true, true);

        let accounts = await instance.db_api().exec('get_accounts', [[account], false]);
        account = accounts.find(it => it.name == account);


        let assets = await instance.db_api().exec('get_assets', [[DATA.TOKEN_SYMBOL], false]);
        let coreAsset = assets.find(it => it.symbol == DATA.TOKEN_SYMBOL);

        let tr = new TransactionBuilder();

        //更新账户投票
        let updateObject = { account: account.id };
        let new_options = { memo_key: account.options.memo_key };

        //GRAPHENE_PROXY_TO_SELF_ACCOUNT
        new_options['voting_account'] = new_proxy_id ? new_proxy_id : "1.2.5";
        //new_options.num_witness = 0;//voteWitnesses.length;
        new_options['num_committee'] = 0;

        updateObject['new_options'] = new_options;
        // Set fee asset
        updateObject['fee'] = {
            amount: 0,
            asset_id: coreAsset.id
        };

        updateObject['new_options'].votes = voteWitnesses.map(it => [it.vote_id, 100]);
        //console.log("updateObject:" + JSON.stringify(updateObject));

        tr.add_type_operation("account_update", updateObject);

        // if (account.lifetime_referrer != account.id) {
        //     tr.add_type_operation("account_upgrade", {
        //         fee: {
        //             amount: 0,
        //             asset_id: coreAsset.id
        //         },
        //         account_to_upgrade: account.id,
        //         upgrade_to_lifetime_member: true
        //     });
        // }

        await tr.set_required_fees();

        //console.log("finish set_required_fees");
        tr.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());
        //tr.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());

        let result = await this.processTranscation(tr);

        console.log("account_update result:");
        console.log(JSON.stringify(result));
        return result;
    }

    static async createCliffVestingBalance(pKey, account, amt, period = 1) {
        let instance = await DnaUtilWsApiProvider.instance(true, true);

        let accounts = await instance.db_api().exec('get_accounts', [[account], false]);
        account = accounts.find(it => it.name == account);


        let assets = await instance.db_api().exec('get_assets', [[DATA.TOKEN_SYMBOL], false]);
        let coreAsset = assets.find(it => it.symbol == DATA.TOKEN_SYMBOL);

        let tr = new TransactionBuilder();

        //添加vesting balance
        let vestingObject = { creator: account.id, owner: account.id };
        vestingObject['fee'] = {
            amount: 0,
            asset_id: coreAsset.id
        };
        vestingObject['amount'] = {
            amount: DnaUtilUtilProvider.toUnit(amt),
            asset_id: coreAsset.id
        };
        //cliff_vesting_policy
        //console.log(ops.cliff_vesting_policy_initializer);
        let duration = period * DATA.periodSecond;
        vestingObject['policy'] = [
            3, {
                duration: duration
            }
        ];
        tr.add_type_operation("vesting_balance_create", vestingObject);


        await tr.set_required_fees();

        tr.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());

        let result = await this.processTranscation(tr);

        console.log("vesting_balance_create result:");
        console.log(result);
        return result;
    }

    static async withdrawCliffVestingBalance(pKey, account, amt, vesting_balance_id) {
        let instance = await DnaUtilWsApiProvider.instance(true, true);

        let accounts = await instance.db_api().exec('get_accounts', [[account], false]);
        account = accounts.find(it => it.name == account);

        let assets = await instance.db_api().exec('get_assets', [[DATA.TOKEN_SYMBOL], false]);
        let coreAsset = assets.find(it => it.symbol == DATA.TOKEN_SYMBOL);

        let tr = new TransactionBuilder();

        //withdraw balance
        let withdrawObject = { owner: account.id };
        withdrawObject['fee'] = {
            amount: 0,
            asset_id: coreAsset.id
        };
        withdrawObject['amount'] = {
            amount: DnaUtilUtilProvider.toUnit(amt),
            asset_id: coreAsset.id
        };
        withdrawObject['vesting_balance'] = vesting_balance_id;
        tr.add_type_operation("vesting_balance_withdraw", withdrawObject);


        await tr.set_required_fees();

        tr.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());

        let result = await this.processTranscation(tr);

        console.log("vesting_balance_withdraw result:");
        console.log(result);
        return result;
    }

    static async registerOrUpdateWitness(pKey, account, signingKey, url, reward_pct = 8000) {
        console.log("registerOrUpdateWitness:" + account);
        let instance = await DnaUtilWsApiProvider.instance(true, true);

        let accounts = await instance.db_api().exec('get_accounts', [[account], false]);
        account = accounts.find(it => it.name == account);

        let assets = await instance.db_api().exec('get_assets', [[DATA.TOKEN_SYMBOL], false]);
        let coreAsset = assets.find(it => it.symbol == DATA.TOKEN_SYMBOL);
        // console.log(account);
        //如果账户的lifetime_referrer_name等于自己，表示已升级
        if (account.lifetime_referrer != account.id) {
            //先升级账户为终身会员
            console.log("need account_upgrade");
            let trUpgradeAccount = new TransactionBuilder();
            trUpgradeAccount.add_type_operation("account_upgrade", {
                fee: {
                    amount: 0,
                    asset_id: coreAsset.id
                },
                account_to_upgrade: account.id,
                upgrade_to_lifetime_member: true
            });
            await trUpgradeAccount.set_required_fees();
            trUpgradeAccount.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());

            let upgradeResult = await this.processTranscation(trUpgradeAccount);

            console.log("account_upgrade result:");
            console.log(upgradeResult);
        }


        let trWitness = new TransactionBuilder();
        let accountWitness = await instance.db_api().exec('get_witness_by_account', [account.name]);
        //signingKey = pKey.toPublicKey().toPublicKeyString();
        if (accountWitness) {
            // console.log("update witness");
            //已经是见证人，更新
            let args = {
                fee: {
                    amount: 0,
                    asset_id: coreAsset.id
                },
                witness: accountWitness.id,
                witness_account: account.id,
            };
            if (url && url != "") args['new_url'] = url;
            if (signingKey && signingKey != "") args['new_signing_key'] = signingKey;
            if (reward_pct) args['block_producer_reward_pct'] = reward_pct;
            // console.log("witness_update operation:");
            // console.log(JSON.stringify(args));
            trWitness.add_type_operation("witness_update", args);
        } else {
            // console.log("creare witness");
            //不是见证人，注册
            let args = {
                fee: {
                    amount: 0,
                    asset_id: coreAsset.id
                },
                witness_account: account.id,
                url: url,
                block_signing_key: signingKey,
                block_producer_reward_pct: reward_pct || 5000
            };

            // console.log("witness_create operation:");
            // console.log(JSON.stringify(args));
            trWitness.add_type_operation("witness_create", args);
        }

        await trWitness.set_required_fees();
        trWitness.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());
        // console.log(trWitness);
        let result = await this.processTranscation(trWitness);
        console.log("witness_create result:");
        console.log(result);
        return result;
    }

    static async processTranscation(tr) {
        let instance = await DnaUtilWsApiProvider.instance(true, true);
        await tr.finalize();
        tr.sign(instance.chain_id);
        console.log(instance.chain_id)
        if (!tr.tr_buffer) {
            throw new Error("not finalized");
        }
        if (!tr.signatures.length || !tr.signed) {
            throw new Error("not signed");
        }
        if (!tr.operations.length) {
            throw new Error("no operations");
        }
        let tr_object = ops.signed_transaction.toObject(tr);
        console.log(JSON.stringify(tr.serialize()))

        return new Promise((resolve, reject) => {
            instance.network_api()
                .exec("broadcast_transaction_with_callback", [
                    function (res) {
                        return resolve(res);
                    },
                    tr_object
                ])
                .then(function (res) {
                    //console.log('... broadcast success, waiting for callback')
                    //if (was_broadcast_callback) was_broadcast_callback();
                    return;
                })
                .catch(error => {
                    // console.log may be redundant for network errors, other errors could occur
                    return reject(error);
                });
        })


    }
}

