// 网络请求封装
import axios from 'axios'
import DATA from '../../data/data'
import qs from 'qs'
import message from './message.js'
import _VM from '@/main.js'
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'

// POST方法
export async function post(url, param) {
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
      reject(e)
    })
  })
}

// GET方法
export async function get(url, param) {
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
      console.log(e.message)
      // 网络异常，静默提示
      if (e.message == 'Network Error') {
        reject(e)
        return
      }
      // if (e == -1) {

      // } else {
      message.error(_VM.$t(`error.web[${e}]`))
      //}
      reject(e)
    })
  })
}

// BTS相关的请求

// BTS的http请求
export async function btsRegPost(url, param) {
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
      reject(e)
    })
  })
}

// BTS的RPC请求方法
// 使用URLSearchParam处理跨域问题
export async function btsRpcPost(method, params) {
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
      reject(e)
    })
  })
}


// GET方法
export async function globalGet(url, param) {
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
      reject(e)
    })
  })
}