// 系统常量
// 系统版本号，格式：版本 上次更新日期（日期格式：英文月份-日-年）
let VERSION = '0.0.6 April-17-2020';
// 接口地址
let BASE_URL = 'https://mvsdna.info';  // explorer.mvsdnadev.com
// 注册服务地址，可以同接口地址，然后在nginx反代
let BASE_REG_URL = BASE_URL;
// HTTP RPC
let HTTP_RPC_URL = 'https://mvsdna.info/rpc'; //'https://mvsdna.info/ws';
// WS RPC
let WS_RPC_URL = 'wss://mvsdna.info/ws';

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

let APPS_URL = 'https://wallet-api.mvsdna.info/wallet/apps?network=mainnet';

let ICONS = {
  DNA: 'assets/icon/DNA.png',
  ETP: 'assets/icon/ETP.png',
};

let OPERATIONS = [
  "transfer",
  "limit_order_create",
  "limit_order_cancel",
  "call_order_update",
  "fill_order",
  "account_create",
  "account_update",
  "account_whitelist",
  "account_upgrade",
  "account_transfer",
  "asset_create",
  "asset_update",
  "asset_update_bitasset",
  "asset_update_feed_producers",
  "asset_issue",
  "asset_reserve",
  "asset_fund_fee_pool",
  "asset_settle",
  "asset_global_settle",
  "asset_publish_feed",
  "witness_create",
  "witness_update",
  "proposal_create",
  "proposal_update",
  "proposal_delete",
  "withdraw_permission_create",
  "withdraw_permission_update",
  "withdraw_permission_claim",
  "withdraw_permission_delete",
  "committee_member_create",
  "committee_member_update",
  "committee_member_update_global_parameters",
  "vesting_balance_create",
  "vesting_balance_withdraw",
  "worker_create",
  "custom",
  "assert",
  "balance_claim",
  "override_transfer",
  "transfer_to_blind",
  "blind_transfer",
  "transfer_from_blind",
  "asset_settle_cancel",
  "asset_claim_fees",
  "fba_distribute",
  "bid_collateral",
  "execute_bid",
  "asset_claim_pool",
  "asset_update_issuer",
  "htlc_create",
  "htlc_redeem",
  "htlc_redeemed",
  "htlc_extend",
  "htlc_refund",
  "custom_authority_create",
  "custom_authority_update",
  "custom_authority_delete",
  "witness_disable",
  "witness_reward",
  "voter_reward",
  "loan_parameters_set",
  "loan_asset_create",
  "loan_asset_update",
  "loan_asset_feed",
  "loan_asset_supply",
  "loan_asset_withdraw",
  "loan_asset_borrow",
  "loan_asset_repay",
  "loan_asset_liquidate",
  "loan_asset_proposal_create",
  "loan_asset_proposal_vote",
  "loan_asset_claim_mine",
];

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

  APPS_URL: APPS_URL,

  icons: ICONS,
  operations: OPERATIONS,

  NETWORKS: networks
}
export default data;