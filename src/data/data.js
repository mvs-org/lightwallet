// 系统常量
// 系统版本号，格式：版本 上次更新日期（日期格式：英文月份-日-年）
let VERSION = '0.0.6 April-17-2020';
// 接口地址
let BASE_URL = 'https://explorer.mvsdnadev.com';  // explorer.mvsdnadev.com
// 注册服务地址，可以同接口地址，然后在nginx反代
let BASE_REG_URL = BASE_URL;
// HTTP RPC
let HTTP_RPC_URL = 'https://explorer.mvsdnadev.com/rpc'; //'https://mvsdna.info/ws';
// WS RPC
let WS_RPC_URL = 'wss://explorer.mvsdnadev.com/ws';

let TOKEN_SYMBOL = "DNA";
let TOKEN_ASSET_ID = "1.3.0";
let TOKEN_DECIMAL = 4;

let PERIOD_AMOUNT = 64;//用于前端文字
let PERIOD_TEXT = 'd';//用于前端文字,m分钟，d天

let PERIOD_SECOND = 64 * 24 * 60 * 60;
let WITNESS_MIN_LOCKED = 1000 * 10000;

let METAVERSE_BURN_DID = "";
let METAVERSE_BURN_ADDRESS = "";
let CHAIN_ID = "24938a99198d850bb7d79010c1325fb63fde63e8e477a5443ff5ce50ab867055";
let KEY_PREFIX = "DNA";

let ICONS = {
    DNA: 'assets/icon/DNA.png',
    ETP: 'assets/icon/ETP.png',
    DBTC: '',
    DETP: '',
};

//是否为测试网络
let IS_TEST_NET = 0;
let TEST_NET_URL = "";

let TEST_NET_CHAINID = CHAIN_ID;
let MAIN_NET_URL = "";
let MAIN_NET_CHAINID = CHAIN_ID;

let networks = [
  {
    show: IS_TEST_NET || TEST_NET_URL,
    default: IS_TEST_NET ? true : false,
    net: "bts",
    version: "testnet",
    key: "btstestnet",
    url: TEST_NET_URL,
    chainId: TEST_NET_CHAINID,
    keyPrefix: KEY_PREFIX,
    coreTokenSymbol: TOKEN_SYMBOL,
  },
  {
    show: (!IS_TEST_NET) || MAIN_NET_URL,
    default: IS_TEST_NET ? false : true,
    net: "bts",
    version: "mainnet",
    key: "btsmainnet",
    url: MAIN_NET_URL,
    chainId: MAIN_NET_CHAINID,
    keyPrefix: KEY_PREFIX,
    coreTokenSymbol: TOKEN_SYMBOL,
  }
];


let data = {
  VERSION: VERSION,
  // 通用后端请求地址（主要是数据报表服务）
  BASE_URL: BASE_URL,
  // BTS注册服务请求地址
  BASE_REG_URL: BASE_REG_URL,
  HTTP_RPC_URL: HTTP_RPC_URL,
  //Bitshares web socket
  WS_RPC_URL: WS_RPC_URL,
  TOKEN_SYMBOL: TOKEN_SYMBOL,
  TOKEN_ASSET_ID: TOKEN_ASSET_ID,
  TOKEN_DECIMAL: TOKEN_DECIMAL,

  //TODO:需要更新为16天
  periodSecond: PERIOD_SECOND,

  periodAmount: PERIOD_AMOUNT,
  periodText: PERIOD_TEXT,

  witnessMinLocked: WITNESS_MIN_LOCKED,

  metaverseBurnDID: METAVERSE_BURN_DID,
  metaverseBurnAddress: METAVERSE_BURN_ADDRESS,

  icons: ICONS,

  NETWORKS: networks
}
export default data;