import { Injectable } from '@angular/core';

import BigNumber from 'bignumber.js'
import cryptoJS from 'crypto-js'

import { DnaUtilRegexProvider } from '../dna-util-regex/dna-util-regex';

let DATA = require('../../data/data.js').default;

@Injectable()
// 常用工具包
export class DnaUtilUtilProvider {

    // 使用千位分隔符格式化大数字
    static formatNumber(numString, decimals) {
        // 判断是不是数字，非数字返回字符串"-"
        if (!DnaUtilRegexProvider.isNum(numString)) {
            return '-'
        }
        if (typeof decimals == 'number' && decimals >= 0) {
            numString = parseFloat(numString).toFixed(decimals);
        }
        numString = String(numString)
        // 对原始数据字符串进行处理
        let numArray = numString.split('.')
        // 三位以下不做处理
        if (numArray[0].length <= 3) {
            return numString
        }
        // 三位以上使用千位分隔符处理
        numArray[0] = numArray[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,')

        return numArray.join('.')
    }

    // 数字补零（呈现出01、002、0003之类的效果）
    // numString: 需要补的数字
    // bits: 总位数
    static paddingZero(numString, bits) {
        // console.log(numString)
        // 判断是不是数字，非数字返回字符串"-"
        if (!DnaUtilRegexProvider.isNum(numString)) {
            return '-'
        }
        // console.log(numString)
        // 仅支持整数，因此小数点后全部抛掉
        let num = String(numString).split('.')[0]

        // 需要补的零位
        let needBits = bits - num.length

        // 对于已经达到位数要求的数，直接返回原数据的整数部分
        if (needBits <= 0) {
            return num
        }
        // 开始补零
        let zeros = ''
        for (let i = 0; i < needBits; i++) {
            zeros += '0'
        }
        num = zeros + num
        return num
    }

    // DataURL转Blob
    static dataURL2Blob(dataUrl) {
        let arr = dataUrl.split(',')
        let mime = arr[0].match(/:(.*?);/)[1]
        let bStr = atob(arr[1])
        let n = bStr.length
        let unit8Array = new Uint8Array(n)
        while (n--) {
            unit8Array[n] = bStr.charCodeAt(n)
        }
        return new Blob([unit8Array], { type: mime })
    }

    // 下载（DataURL）
    static download(dataUrl, fileName) {
        let link = document.createElement("a")
        link.download = fileName
        link.style.display = "none"
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // 私钥加密
    static encryptKey(str, password) {
        //console.log("encrypt:" + str);
        //console.log("password:" + password);

        str = cryptoJS.enc.Utf8.parse(str);
        password = cryptoJS.enc.Utf8.parse(password);

        let hash = cryptoJS.SHA256(password).toString();
        let key = hash.substr(0, 16);
        let iv = hash.substr(hash.length - 16);

        key = cryptoJS.enc.Utf8.parse(key);
        iv = cryptoJS.enc.Utf8.parse(iv);

        //console.log(`before encrypt: ${str}, key: ${key}, iv: ${iv}`);
        let cipherText = cryptoJS.AES.encrypt(str, key, {
            iv: iv,
            mode: cryptoJS.mode.CBC
        }).ciphertext;
        //console.log("after encrypt: " + cipherText);

        return cryptoJS.enc.Base64.stringify(cipherText);
    }

    // 私钥解密
    static decryptKey(str, password) {
        //console.log("encrypt:" + str);
        //console.log("password:" + password);
        password = cryptoJS.enc.Utf8.parse(password);

        let hash = cryptoJS.SHA256(password).toString();
        let key = hash.substr(0, 16);
        let iv = hash.substr(hash.length - 16);

        key = cryptoJS.enc.Utf8.parse(key);
        iv = cryptoJS.enc.Utf8.parse(iv);

        let cipherText = cryptoJS.enc.Base64.parse(str);
        cipherText = cryptoJS.enc.Base64.stringify(cipherText);
        //cipherText = cryptoJS.enc.Utf8.parse(cipherText);
        // 格式化密文
        // console.log(`before decrypt: ${cipherText}, key: ${key}, iv: ${iv}`);

        let objText
        try {
            objText = cryptoJS.AES.decrypt(cipherText, key, {
                iv: iv,
                mode: cryptoJS.mode.CBC
            }).toString(cryptoJS.enc.Utf8).toString();
        } catch (e) {
            //console.log(e)
            throw { code: 'inner', message: "E_003" }
        }
        //console.log("after decrypt: " + objText);
        return objText
    }

    // 下载私钥文件
    static downloadKeyFile(filename, cipherText, net) {
        // 构造对象
        let jsonInfo = {
            version: DATA.VERSION,
            net,
            createTime: new Date().getTime(),
            key: cipherText
        }
        let text = JSON.stringify(jsonInfo)
        let dom = document.createElement('a');
        dom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        dom.setAttribute('download', filename);

        if (document.createEvent) {
            let event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            dom.dispatchEvent(event);
        }
        else {
            dom.click();
        }
    }

    // 获取私钥文件内容
    static getKeyFile(cipherText, net) {
        return {
            version: DATA.VERSION,
            net,
            createTime: new Date().getTime(),
            key: cipherText
        }
    }

    // 读取私钥文件
    static async readKeyFile(file) {
        // 使用FileReader，解决一些兼容性问题
        return new Promise(async (resolve, reject) => {
            let text = await this.readFileAsText(file)
            let fileJson
            // 解析文件
            try {
                fileJson = JSON.parse('' + text)
            } catch (e) {
                reject('E_001')
                return
            }
            // 分析文件合法性
            if (!fileJson.net) {
                reject('E_001')
            }
            if (!fileJson.key) {
                reject('E_001')
            }
            // 文件判定正确，返回文本，解密与网络判断由调用者处理
            resolve(fileJson)
        })
    }

    static async readFileAsText(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader()
            reader.readAsText(file, 'UTF-8')
            reader.onload = function (e) {
                let data = this.result
                resolve(data)
            }
            reader.onerror = function (e) {
                reject(e)
            }
        })
    }

    // 格式化日期与时间
    static formatDateTime(timeStamp) {
        let date = new Date(timeStamp)
        let y = date.getFullYear()
        let m = this.paddingZero(date.getMonth() + 1, 2)
        let d = this.paddingZero(date.getDate(), 2)
        let hh = this.paddingZero(date.getHours(), 2)
        let mm = this.paddingZero(date.getMinutes(), 2)
        let ss = this.paddingZero(date.getSeconds(), 2)
        return `${y}/${m}/${d} ${hh}:${mm}:${ss}`
    }

    // 格式化时间间距
    // 返回一个已经格式化的字符串
    static formatTimeDistance(distance, isLater = false) {
        // 秒数
        distance = distance >= 0 ? distance : 0
        let sec = parseInt('' + (distance / 1000))
        //let str = ''
        let minSec = 60;
        let hourSec = 3600;
        let daySec = 86400;
        let isLaterTxt = isLater ? "Later" : "";
        if (sec < minSec) {
            return ['global.timeDistanceSec' + isLaterTxt, { s: sec }];
        }
        if (sec >= minSec && sec < hourSec) {
            // console.log(sec)
            let m = parseInt('' + (sec / minSec))
            return ['global.timeDistanceMin' + isLaterTxt, { m }]
        }
        if (sec >= hourSec && sec < daySec) {
            let h = parseInt('' + (sec / hourSec))
            //let m = parseInt((sec % hourSec) / minSec)
            //let s = (sec % hourSec) % minSec
            return ['global.timeDistanceHours' + isLaterTxt, { h }]
        }
        if (sec >= daySec) {
            let d = parseInt('' + (sec / daySec))
            return ['global.timeDistanceDays' + isLaterTxt, { d }]
        }
    }

    // 得到最近过去七天的日期
    // 返回一个字符串数组
    static getPastSevenDate(includeToday = false) {
        let dateNow = new Date().getTime()
        // 得到过去7天的时间戳
        let timeStampList = []
        let start = 1;
        let end = 7;
        if (includeToday) {
            start = 0;
            end = 6;
        }
        for (let i = start; i <= end; i++) {
            timeStampList.unshift(dateNow - (86400000 * i))
        }
        // 换算
        for (let i in timeStampList) {
            let date = new Date(timeStampList[i])
            let dateStr = (date.getMonth() + 1) + '/' + date.getDate()
            timeStampList[i] = dateStr
        }
        return timeStampList
    }

    // 将16进制色值换算为10进制，返回一个对象
    static hexToNum(hex) {
        if (hex[0] == '#') {
            hex = hex.substr(1, 6)
        }
        let r = Number('0x' + hex.substr(0, 2))
        let g = Number('0x' + hex.substr(2, 2))
        let b = Number('0x' + hex.substr(4, 2))
        return { r, g, b }
    }

    /**
     * 将对象数组按照指定的属性排序，返回排序后的新数组
     * @param {*要排序的对象数组} list
     * @param {*要比对的属性} property
     * @param {*升序或降序} direction
     */
    static sortArray(list, property, direction) {
        // 拷贝原数组
        let nList = []
        for (let i in list) {
            nList.push(list[i])
        }
        nList.sort(compare(property, direction))
        return nList
    }

    static trimEndZero(value) {
        let f = parseFloat(value);
        if (isNaN(f)) {
            return value
        }
        return f.toString()
    }

    /**
     * 把大数字转换成：英文Thousand/Million/Billion,中文亿/万，可在语言文件中设置
     * @param {*需要转换的数字} value
     * @param {*进位及显示单位，可在语言文件设置} symbols
     * @param {*显示少数点位数} fixed
     */
    static formatNumeral(value, symbols, fixed = 2, trimZero = false) {
        if (!value || isNaN(Number(value))) {
            return value;
        }
        //     symbols
        //     EN: [
        //         [Math.pow(10, 9), 'B'],//Billion
        //         [Math.pow(10, 6), 'M'],//Million
        //         [Math.pow(10, 3), 'T'],//Thousand
        //     ],
        //     CN: [
        //         [Math.pow(10, 12), '兆'],
        //         [Math.pow(10, 8), '亿'],
        //         [Math.pow(10, 4), '万'],
        //     ],
        if (!symbols || !symbols.length) {
            return value;
        }
        var output = '';

        for (var i = 0; i < symbols.length; i++) {
            var sym = symbols[i];

            if (value / sym[0] >= 1) {
                output = sym[1] + output;
                value /= sym[0];
            }
        }
        value = parseFloat(value).toFixed(fixed);
        if (trimZero) {
            value = this.trimEndZero(value);
        }

        return value + output;
    }

    /**
     * Token金额大数字显示
     * @param {*原始金额} value
     * @param {*formatNumeral的进位及显示单位，如空则使用千位分隔} numeralSymbols
     * @param {*显示小数位数} fixed
     * @param {*代币符号} tokenSymbol
     * @param {*代币Decimal} tokenDecimal
     */
    static formatToken(value, numeralSymbols = [], fixed = 2, tokenSymbol = DATA.TOKEN_SYMBOL, tokenDecimal = DATA.TOKEN_DECIMAL) {
        let trimZero = true;//原来的全部trim

        let bn = new BigNumber(value);
        value = bn.div((new BigNumber(10)).pow(tokenDecimal)).toFixed(fixed);

        if (trimZero) {
            value = this.trimEndZero(value);
        }

        if (numeralSymbols && numeralSymbols.length) {
            value = this.formatNumeral(value, numeralSymbols, fixed, trimZero);
        } else {
            value = this.formatNumber(value, undefined);
        }
        if (tokenSymbol) {
            value += " " + tokenSymbol;
        }
        return value;

    }

    static formatTokenWithOptions(value, opts) {
        opts = opts || {};
        let numeralSymbols = opts.numeralSymbols || [];
        let fixed = typeof (opts.fixed) == 'undefined' ? DATA.TOKEN_DECIMAL : opts.fixed;
        let tokenSymbol = typeof (opts.tokenSymbol) == 'undefined' ? DATA.TOKEN_SYMBOL : opts.tokenSymbol;
        let tokenDecimal = typeof (opts.tokenDecimal) == 'undefined' ? DATA.TOKEN_DECIMAL : opts.tokenDecimal;
        let trimZero = opts.trimZero || false;


        let bn = new BigNumber(value);
        value = bn.div((new BigNumber(10)).pow(tokenDecimal)).toFixed(fixed);
        if (trimZero) {
            value = this.trimEndZero(value);
        }

        if (numeralSymbols && numeralSymbols.length) {
            value = this.formatNumeral(value, numeralSymbols, fixed);
        } else {
            value = this.formatNumber(value, undefined);
        }
        if (tokenSymbol) {
            value += " " + tokenSymbol;
        }
        return value;
    }

    /**
     * 把 常用单位数值 转换成 基础单位数值
     * 如value=，tokenDecimal=5
     * 返回900000
     * @param {*} value
     * @param {*} tokenDecimal
     */
    static toUnit(value, tokenDecimal = DATA.TOKEN_DECIMAL) {
        let bn = new BigNumber(value);
        bn = bn.times((new BigNumber(10)).pow(tokenDecimal));
        return bn.toFixed(0);
    }

    /**
     * 把 基础单位数值 转换成 常用单位数值
     * 如value=900000，tokenDecimal=5
     * 返回9.00000
     * @param {*} value
     * @param {*} tokenDecimal
     */
    static toToken(value, tokenDecimal = DATA.TOKEN_DECIMAL) {
        let bn = new BigNumber(value);
        bn = bn.div((new BigNumber(10)).pow(tokenDecimal));
        return bn.toFixed(tokenDecimal);
    }
}

// 排序使用比较函数
function compare(property, direction) {
    return function (obj1, obj2) {
        var value1 = obj1[property]
        var value2 = obj2[property]
        if (direction == 1) {
            // 升序
            return value1 - value2
        }
        // 默认降序
        return value2 - value1
    }
}
