import { Injectable } from '@angular/core';

let PATTERN = require('../../data/pattern.js').default;

@Injectable()
export class DnaUtilRegexProvider {

    // 校验手机号码
    static isMobilePhone(str) {
        return PATTERN.PHONE.test(str)
    }

    // 校验邮箱
    static isEmail(str) {
        return PATTERN.MAIL.test(str)
    }

    // 判断是不是数字
    static isNum(str) {
        if (str === '') {
            return false
        }
        if (isNaN(Number(str))) {
            return false
        }
        return true
    }

    // 判断BTS的用户名是符合规则
    static isBtsNameLegal(str, global = false) {
        if (global) {
            return PATTERN.BTS_USER_NAME_GLOBAL.test(str)
        } else {
            return PATTERN.BTS_USER_NAME.test(str)
        }
    }

    // 判断密码是否符合规则
    static isPasswordLegal(str) {
        return PATTERN.PASSWORD.test(str);
        // if (str.length < 9) {
        //   return false
        // }
        // return this.isNum(str)
    }

    // 判断是不是合法hash
    static isHashLegal(str) {
        return PATTERN.HASH.test(str)
    }
}