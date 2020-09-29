import { Injectable } from '@angular/core';
import { ChainTypes } from 'bitsharesjs';
import { DnaUtilWsApiProvider } from "../dna-util-ws-api/dna-util-ws-api";

@Injectable()
export class DnaReqWsSubscribeProvider {

    static async getChainId() {
        let instance = await DnaUtilWsApiProvider.instance(false, false);
        return instance.chain_id;
    }

    /**
     * 订阅账户余额
     * @param {*账户名称} accountName
     * @param {*余额变化回调函数，保留以兼容旧版调用} fnBalance
     * @param {*账户变化回调函数} fnFullAccount
     */
    static async subscribeAccountBalance(accountName, fnBalance, fnVestingBalance, fnFullAccount) {
        // console.log("subscribeAccountBalance");
        let instance = await DnaUtilWsApiProvider.instance(true, false);
        // TODO:这里除了余额外，还会有其他消息被订阅

        // console.log("await get_full_accounts");
        let res = await instance.db_api().exec("get_full_accounts", [[accountName], true])

        console.log('ws api get_full_accounts:', res)

        // console.log(JSON.stringify(res));
        if (res && res.length) {
            let accountObjArr = res.find(it => it[0] == accountName);
            if (accountObjArr) {
                let accountObj = accountObjArr[1];
                if (fnFullAccount) {
                    fnFullAccount(accountObj);
                }
                let vesting_balances = accountObj.vesting_balances;
                fnVestingBalance();//删除
                for (let i = 0; i < vesting_balances.length; i++) {
                    fnVestingBalance(vesting_balances[i]);
                    //注册监听函数到callback，balance对象发生变化会再次调用
                    DnaUtilWsApiProvider.addHandler(vesting_balances[i].id, fnVestingBalance);
                }
                let balances = accountObj.balances;
                if (balances.length) {
                    for (let i = 0; i < balances.length; i++) {
                        //先把balance找出来，调用一次cb
                        fnBalance(balances[i])

                        //注册监听函数到callback，balance对象发生变化会再次调用
                        DnaUtilWsApiProvider.addHandler(balances[i].id, fnBalance);
                    }
                } else {
                    //新账户没有余额对象，先通过通配符+条件监听
                    //注册id通配符+条件匹配
                    DnaUtilWsApiProvider.addHandler("2.5.*|owner:" + accountObj.account.id, fnBalance);
                }
                // 返回值非必须，因为统一在回调函数中处理
                return balances;
            }
        }
        return [];

    }

    // 订阅最新区块
    static async subscribeLatestBlock(fn) {
        let instance = await DnaUtilWsApiProvider.instance(true, false)
        let res = await instance.db_api().exec("get_dynamic_global_properties", [])
        fn(res)
        //注册监听函数到callback
        //wsApi.addHandler(res.id, fn);
    }

    static async wsGetAccountHistoryOperations(account, operation_type = 0, start = '1.11.0', stop = '1.11.0', limit = 100) {
        let instance = await DnaUtilWsApiProvider.instance(false, false);
        return await instance.history_api().exec('get_account_history_operations', [account, operation_type, start, stop, limit]);
    }

    // 获取区块奖励
    static async wsGetFullAccount(account) {
        let instance = await DnaUtilWsApiProvider.instance(false, false)
        let data = await instance.db_api().exec('get_full_accounts', [[account]])
        return data
    }

    static async wsGetVestingBalances(account) {
        let instance = await DnaUtilWsApiProvider.instance(false, false)
        let data = await instance.db_api().exec('get_vesting_balances', [account])
        return data
    }

    static async wsListAssets() {
        let instance = await DnaUtilWsApiProvider.instance(false, false)
        let data = await instance.db_api().exec('list_assets', ['BTS', 100])
        return data;
    }

    // 获取最新区块
    static async wsFetchHeadBlock() {
        let instance = await DnaUtilWsApiProvider.instance(false, false)
        let data = await instance.db_api().exec("get_dynamic_global_properties", [])
        return data
    }

    // 获取区块奖励
    static async wsFetchBlockReward() {
        let data = await this.wsFetchGlobalProperites();
        return data.parameters.witness_pay_per_block
    }

    // 获取全局参数
    static async wsFetchGlobalProperites() {
        let instance = await DnaUtilWsApiProvider.instance(false, false)
        let data = await instance.db_api().exec('get_global_properties', [])
        return data
    }

    //
    static async wsFetchOperationFees(opsStrs) {
        let data = await this.wsFetchGlobalProperites();
        let fees = data.parameters.current_fees.parameters;
        let feeResults = opsStrs.map((op) => {
            let result = {
                op: op
            }
            if (ChainTypes.operations.hasOwnProperty(op) && typeof ChainTypes.operations[op] == 'number') {
                let opId = ChainTypes.operations[op];
                let fee = fees.find(it => it[0] == opId);
                if (fee) {
                    fee = fee[1];
                    for (var k in fee) {
                        result[k] = fee[k];
                    }
                }
            }
            return result;
        })
        return feeResults;
    }

    // 获取超级节点信息列表
    static async wsFetchWitness(list) {
        let instance = await DnaUtilWsApiProvider.instance(false, false)
        let data = await instance.db_api().exec('get_witnesses', [list])
        return data
    }

    // 根据account获取超级节点信息
    static async wsFetchWitnessByAccount(account) {
        let instance = await DnaUtilWsApiProvider.instance(false, false)
        let data = await instance.db_api().exec('get_witness_by_account', [account])
        return data
    }

    static async wsFetchAllWitness() {
        let instance = await DnaUtilWsApiProvider.instance(false, false);
        let lower_bound_name = "", limit = 1000;
        let accountWitness = [];
        while (1) {
            let data = await instance.db_api().exec('lookup_witness_accounts', [lower_bound_name, limit]);
            if (!data || !data.length) {
                break;
            }
            if (lower_bound_name) {
                //包含了lower_bound_name的结果，删除
                //如果在push中判断重复时间复杂度高
                accountWitness.push(...data.slice(1));
            } else {
                accountWitness.push(...data);
            }
            if (data.length >= limit) {
                //未获取完成，继续获取
                lower_bound_name = data[data.length - 1][0];
            } else {
                //已获取完成
                break;
            }
        }
        //console.log(accountWitness);
        let ids = accountWitness.map(it => it[1]);
        //获取见证人详情
        let witnesses = await instance.db_api().exec('get_witnesses', [ids]);
        witnesses.forEach((item) => {
            //把账号名车插入到返回对象中
            let aw = accountWitness.find(it => it[1] == item.id);
            if (aw) {
                item.witness_account_name = aw[0];
            }
        });
        //console.log(witnesses);
        return witnesses;
    }

    // 获取目标区块信息
    static async wsFetchBlock(blockHeight) {
        let instance = await DnaUtilWsApiProvider.instance(false, false)
        let data = await instance.db_api().exec('get_block', [blockHeight])
        return data
    }

    // 获取目标区块前x个区块的信息
    static async wsFetchBlocksByRange(range, block) {
        let hiBlock = block
        let loBlock = hiBlock - range + 1
        // FIXME: get_blocks不能调用，使用get_block逐个查询
        let blockList = []
        for (let i = loBlock; i <= hiBlock; i++) {
            let blockData = await this.wsFetchBlock(i)
            blockData.height = i
            blockList.push(blockData)
        }
        return blockList
    }

    // 根据公钥获取BTS账户ID
    static async wsFetchBtsGetAccount(publicKey) {
        let instance = await DnaUtilWsApiProvider.instance(false, false)
        let data = await instance.db_api().exec('get_key_references', [[publicKey]])
        return data
    }

    // 根据ID获得BTS账户详情
    static async wsFetchBtsGetAccountDetail(btsId) {
        let instance = await DnaUtilWsApiProvider.instance(false, false)
        let data = await instance.db_api().exec('get_accounts', [[btsId], false])
        return data
    }

    // 根据ID获得BTS账户详情
    static async wsFetchBtsGetAccountsDetail(btsIds) {
        let instance = await DnaUtilWsApiProvider.instance(false, false)
        let data = await instance.db_api().exec('get_accounts', [btsIds, false])
        return data
    }

    // 根据ID批量查询BTS账户详情
    static async wsFetchBtsGetAccountDetailByList(idList) {
        let instance = await DnaUtilWsApiProvider.instance(false, false)
        let data = await instance.db_api().exec('get_accounts', [idList, false])
        return data
    }

    // 根据区块和index查询某一笔交易的信息
    // index为该笔交易在此区块内的顺序，从0开始
    static async wsFetchTxInfo(block, index) {
        let instance = await DnaUtilWsApiProvider.instance(false, false)
        let data = await instance.db_api().exec('get_transaction', [block, index])
        return data
    }

    static async wsFetchVotingPeriod() {
        let instance = await DnaUtilWsApiProvider.instance(false, false)
        let data = await instance.db_api().exec('get_voting_period', [])
        return data
    }
}