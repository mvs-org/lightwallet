// 系统常量
// 系统版本号，格式：版本 上次更新日期（日期格式：英文月份-日-年）
let VERSION = process.env.NODE_ENV == 'development' ? 'DEBUG' : '0.0.6 April-17-2020';
// 接口地址
let BASE_URL = process.env.BASE_URL || (process.env.NODE_ENV == 'development' ? 'http://127.0.0.1:8101' : 'https://geminiact1.mvsdnadev.com');
// 注册服务地址，可以同接口地址，然后在nginx反代
let BASE_REG_URL = process.env.BASE_REG_URL || (process.env.NODE_ENV == 'development' ? 'http://127.0.0.1:9002' : BASE_URL);
// HTTP RPC
let HTTP_RPC_URL = process.env.HTTP_RPC_URL || (process.env.NODE_ENV == 'development' ? 'http://127.0.0.1:8090' : 'https://geminiact1.mvsdnadev.com/ws');
// WS RPC
let WS_RPC_URL = process.env.WS_RPC_URL || (process.env.NODE_ENV == 'development' ? 'ws://127.0.0.1:8090' : 'wss://geminiact1.mvsdnadev.com/ws');

let TOKEN_SYMBOL = process.env.TOKEN_SYMBOL || "DNA";
let TOKEN_ASSET_ID = process.env.TOKEN_ASSET_ID || "1.3.0";
let TOKEN_DECIMAL = process.env.TOKEN_DECIMAL || 4;

let PERIOD_SECOND = process.env.PERIOD_SECOND || 160 * 60;
let WITNESS_MIN_LOCKED = process.env.WITNESS_MIN_LOCKED || 1000 * 10000;

let METAVERSE_BURN_DID = process.env.METAVERSE_BURN_DID || (process.env.NODE_ENV == 'development' ? "mvsewan" : "dnaswaptest");
let METAVERSE_BURN_ADDRESS = process.env.METAVERSE_BURN_DID || (process.env.NODE_ENV == 'development' ? "MF1EQMCYuSnzELF3qdmUXegCjV1smjk7eZ" : "M87kWD71Xb1DBPWr3CaB4dHsZ2tckpVXTo");
let CHAIN_ID = process.env.CHAIN_ID || "bfb05dfa678219f7ce781573a243ed40e1ebbd5da660ab36a35cb16f106403be";
let KEY_PREFIX = process.env.KEY_PREFIX || "DNA";

//是否为测试网络
let IS_TEST_NET = typeof (process.env.IS_TEST_NET) != 'undefined' ? process.env.IS_TEST_NET : 1;
let TEST_NET_URL = process.env.TEST_NET_URL || "";

let TEST_NET_CHAINID = process.env.TEST_NET_CHAINID || CHAIN_ID;
let MAIN_NET_URL = process.env.MAIN_NET_URL || "";
let MAIN_NET_CHAINID = process.env.MAIN_NET_CHAINID || CHAIN_ID;

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

  witnessMinLocked: WITNESS_MIN_LOCKED,

  metaverseBurnDID: METAVERSE_BURN_DID,
  metaverseBurnAddress: METAVERSE_BURN_ADDRESS,

  NETWORKS: networks
}
export default data;