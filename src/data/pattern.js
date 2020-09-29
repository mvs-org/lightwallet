// 常用正则表达式

export default {
  PHONE: /^1[0-9]{10}$/,
  MAIL: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
  BTS_USER_NAME: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9a-z]{12,12}$/,
  BTS_USER_NAME_GLOBAL: /^[a-z][a-z0-9]*$/,
  HASH: /\b[0-9a-fA-F]+\b/,
  PASSWORD: /^(?=.*[a-zA-Z])(?=.*\d)[^]{9,}$/
}