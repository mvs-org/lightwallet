// 网络请求封装
import { Injectable } from '@angular/core'
import axios from 'axios'

let DATA = require('../../data/data').default;

axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'

@Injectable()
export class DnaUtilHttpProvider {

    // 获取 APP
    static async apps() {
        return new Promise((resolve, reject) => {
            axios({
                url: DATA.APPS_URL,
                method: 'GET',
                headers: {
                    'Content-type': 'application/json'
                },
                data: {},
            }).then((response) => {
                resolve(response.data)
            }).catch((e) => {
                console.log(e);
                reject(e)
            })
        })
    }

    // POST 方法
    static async post(url, param) {
        return new Promise((resolve, reject) => {
            axios({
                url: DATA.BASE_URL + url,
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                data: param,
            }).then((response) => {
                resolve(response.data)
            }).catch((e) => {
                console.log(e);
                reject(e)
            })
        })
    }

    // GET 方法
    static async get(url, param) {
        return new Promise((resolve, reject) => {
            axios({
                url: DATA.BASE_URL + url,
                method: 'GET',
                headers: {
                    'Accept': 'application/problem+json'
                },
                params: param,
            }).then((response) => {
                if (response.data.status.success != 1) {
                    throw response.data.status.success
                }
                resolve(response.data.result)
            }).catch((e) => {
                console.log(e)
                reject(e)
            })
        })
    }

    // BTS相关的请求
    // BTS的http请求
    static async btsRegPost(url, param) {
        return new Promise((resolve, reject) => {
            axios({
                url: DATA.BASE_REG_URL + url,
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                data: JSON.stringify(param)
            }).then((response) => {
                resolve(response.data)
            }).catch((e) => {
                console.log(e);
                reject(e)
            })
        })
    }

    // BTS的RPC请求方法
    // 使用URLSearchParam处理跨域问题
    static async btsRpcPost(method, params) {
        return new Promise((resolve, reject) => {
            let data = {
                id: 1,
                jsonrpc: '2.0',
                method,
                params
            }
            // const urlParam = new URLSearchParams()
            // urlParam.append('id', '1')
            // urlParam.append('jsonrpc', '2.0')
            // urlParam.append('method', method),
            // urlParam.append('params', JSON.stringify(params))
            axios({
                url: DATA.HTTP_RPC_URL,
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                data: data
            }).then((response) => {
                resolve(response.data)
            }).catch((e) => {
                console.log(e);
                reject(e)
            })
        })
    }


    // GET方法
    static async globalGet(url, param) {
        return new Promise((resolve, reject) => {
            axios({
                url: url,
                method: 'GET',
                headers: {
                    'Content-type': 'application/json'
                },
                params: param,
            }).then((response) => {
                resolve(response)
            }).catch((e) => {
                console.log(e);
                reject(e)
            })
        })
    }
}