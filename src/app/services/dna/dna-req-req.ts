import { Injectable } from '@angular/core'
import { DnaUtilHttpProvider } from './dna-util-http';

// 全部的网络请求
@Injectable()
export class DnaReqReqProvider {

    // 注册BTS账户
    static async fetchBtsReg(name, publicKey) {
        let param = {
            account: {
                name,
                owner_key: publicKey,
                active_key: publicKey,
                memo_key: publicKey
            }
        }

        console.log("fetchBtsReg:")
        console.log(JSON.stringify(param.account))

        return await DnaUtilHttpProvider.btsRegPost('/api/v1/dnareg', param)
    }

    // 获得BTS账户ID
    static async fetchBtsGetAccount(publicKey) {
        return await DnaUtilHttpProvider.btsRpcPost('get_key_references', [[publicKey]])
    }

    // 根据ID获得BTS账户详情
    static async fetchBtsGetAccountDetail(btsId) {
        return await DnaUtilHttpProvider.btsRpcPost('get_accounts', [[btsId], false])
    }

    // 获得节点数据
    static async fetchNodeInfo() {
        return await DnaUtilHttpProvider.get('/api/v1/nodes/countinfo', {})
    }

    // 获得目标节点的信息
    static async fetchTargetNodeInfo(name) {
        return await DnaUtilHttpProvider.get(`/api/v1/node/${name}`, {})
    }

    // 获得目标节点的介绍信息
    static async fetchTargetNodeIntro(name) {
        return await DnaUtilHttpProvider.get('/api/v1/node/' + name, {})
    }

    // 获取区块概览
    static async fetchBlockStatus() {
        return await DnaUtilHttpProvider.get('/api/v1/blockstatus', {})
    }

    // 获得Token信息
    static async fetchTokenInfo() {
        return await DnaUtilHttpProvider.get('/api/v1/tokeninfo', {})
    }

    // 分页查询区块
    static async fetchBlockList(page, size) {
        return await DnaUtilHttpProvider.get('/api/v1/blocks', { page, pagesize: size })
    }

    // 根据账户获取资产余额
    static async fetchBtsGetAccountBalances(accountName, assets = []) {
        return await DnaUtilHttpProvider.btsRpcPost('get_account_balances', [accountName, assets])
    }

    // 根据账户获取冻结余额
    static async fetchBtsGetVestingBalances(accountName) {
        return await DnaUtilHttpProvider.btsRpcPost('get_vesting_balances', [accountName])
    }

    // 分页查询账户
    static async fetchAccountList(page, size) {
        return await DnaUtilHttpProvider.get('/api/v1/accounts', { page, pagesize: size })
    }

    // 查询新闻
    static async fetchNews(language = "", page, size) {
        language = language || "en";
        return await DnaUtilHttpProvider.get('/api/v1/news', { language, page, pagesize: size })
    }

    // 查询Foundation
    static async fetchFoundation(page, size) {
        return await DnaUtilHttpProvider.get('/api/v1/foundations', { page, pagesize: size })
    }

    // 查询节点全部信息
    static async fetchAllNodeInfo() {
        return await DnaUtilHttpProvider.get('/api/v1/nodes', {})
    }

    // 查询投票相关信息
    static async fetchVoteInfo(round, page, size, account_name = "", isSuperNode = false) {
        let data = {}
        if (isSuperNode) {
            data = await DnaUtilHttpProvider.get('/api/v1/elections/supernode', { round, account_name })
        } else {
            data = await DnaUtilHttpProvider.get('/api/v1/elections', { round, account_name, page, pagesize: size })
        }
        return data
    }

    // 查询区块详情
    static async fetchBlockInfo(block) {
        return await DnaUtilHttpProvider.get('/api/v1/block/' + block, {})
    }

    // 查询账户详情
    static async fetchAccountInfo(account) {
        return await DnaUtilHttpProvider.get('/api/v1/account/' + account, {})
    }

    // 获取账户统计信息
    static async fetchAccountStat() {
        return await DnaUtilHttpProvider.get('/api/v1/accounts/statistics', {})
    }

    // 获取交易统计信息
    static async fetchTxStat() {
        return await DnaUtilHttpProvider.get('/api/v1/txs/statistics', {})
    }

    // 获取持币者统计信息
    static async fetchHolderStat() {
        return await DnaUtilHttpProvider.get('/api/v1/holders/statistics', {})
    }

    // 获取持币者统计信息
    static async fetchUnholderStat() {
        return await DnaUtilHttpProvider.get('/api/v1/holders/nocoretoken/statistics', {})
    }

    // 获取每日价格信息
    static async fetchPriceStat() {
        return await DnaUtilHttpProvider.get('/api/v1/price/statistics', {})
    }

    // 获取每日供给信息
    static async fetchSupplyStat() {
        return await DnaUtilHttpProvider.get('/api/v1/totalsupply/statistics', {})
    }

    // 根据hash查询交易
    static async fetchTxByHash(hash) {
        return await DnaUtilHttpProvider.get('/api/v1/tx/' + hash, {})
    }

    // 获得Token列表
    static async fetchTokenList(page, pagesize) {
        return await DnaUtilHttpProvider.get('/api/v1/tokens', { page, pagesize })
    }

    // 查询交易列表
    static async fetchTxList(page, pagesize, type) {
        return await DnaUtilHttpProvider.get('/api/v1/txs', { page, pagesize, type })
    }

    static async updateNodeInfo(account, body) {
        return await DnaUtilHttpProvider.post('/api/v1/node/' + account, body)
    }
}

