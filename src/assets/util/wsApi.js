import { Apis, ChainConfig } from "bitsharesjs-ws";
import { ChainStore, FetchChain, PrivateKey, TransactionHelper, Aes, TransactionBuilder } from "bitsharesjs";

import DATA from '../../data/data'
// ChainConfig.address_prefix = DATA.TOKEN_SYMBOL;
// ChainConfig.setPrefix(DATA.TOKEN_SYMBOL)


let wsUri = DATA.WS_RPC_URL;


export default {
    _initedInstance: false,
    _initedSubscribe: false,
    _initedChainstore: false,
    _handlers: {},
    init() {
        let that = this;

        Apis.setRpcConnectionStatusCallback(function (status) {
            if (status == "closed") {
                //停止了
                setTimeout(() => {
                    that.init();
                }, 5 * 1000);
            }
            // console.log("connection status callback:" + status);
        });

        Apis.instance(wsUri, true).init_promise.then((res) => {
            that._initedInstance = true;
            console.log("ws api connected");
            //console.log("connected to:", res[0].network);

            // 初始化订阅
            Apis.instance().db_api().exec("set_subscribe_callback", [function (objects) {
                //console.log("subscribe callbacked");
                that.updateListener(objects)
            }, false]).then((data) => {
                console.log("ws api subscribed");
                that._initedSubscribe = true;
            }).catch(function (err) {
                console.log("ws api subscribed error");
                console.log(JSON.stringify(err));
            })

            // TODO:初始化Chainstore导致回调失败
            that._initedChainstore = true;
            // 初始化Chainstore
            // ChainStore.init(false).then((data) => {
            //     that._initedChainstore = true;
            // })
        })
    },
    async instance(wSub = false, wChain = false) {
        await this.waitForInstance();
        if (wSub) {
            await this.waitForSubscribe();
        }
        if (wChain) {
            await this.waitForChainstore();
        }
        return Apis.instance();
    },
    async waitForInstance() {
        return this._waitFor("_initedInstance")
    },
    async waitForSubscribe() {
        return this._waitFor("_initedSubscribe")
    },
    async waitForChainstore() {
        return this._waitFor("_initedChainstore")
    },
    async _waitFor(boolKey) {
        let that = this;
        return new Promise((resolve, reject) => {
            (function iterator() {
                if (that[boolKey]) {
                    return resolve(true);
                }
                setTimeout(() => {
                    iterator();
                }, 300);
            })();
        })
    },
    /**
     * 添加对Object的监听函数
     * 1、根据object id完全匹配监听
     * 如:id=2.5.10
     * 
     * 2、根据object id通配符匹配监听
     * 如：id=2.5.*
     * 监听到相关object，主动新增一个完全匹配监听
     * 
     * 3、根据object id通配符和object条件属性监控
     * 如：id=2.5.*|owner:1.2.36
     * 在object id通配符匹配的前提下，object必须有属性owner并且值等于1.2.36才能匹配
     * 条件可以0个或多个，用｜隔开
     * 监听到相关object，主动新增一个完全匹配监听
     * 
     * @param {*} id 
     * @param {*} handler 
     */
    addHandler(id, handler) {
        this._handlers[id] = handler;
    },
    removeHandler(id) {
        delete this._handlers[id];
    },
    updateListener(objects) {
        //console.log("updateListener:" + objects.length);
        let that = this;
        objects = objects.flat();
        for (let i = 0; i < objects.length; i++) {
            let obj = objects[i];
            // console.log("updateListener:" + obj.id);
            // console.log("typeof _handlers[obj.id]:" + typeof that._handlers[obj.id]);
            if (that._handlers.hasOwnProperty(obj.id)
                //有完全匹配的
                && typeof that._handlers[obj.id] === "function") {
                that._handlers[obj.id](obj);
            } else {
                //没有完全匹配的，尝试通配符+条件查找
                //如：2.5.*|owner:1.2.36
                //表示：id匹配2.5.*，并且owner属性值为1.2.36的对象
                //|后面为条件，可以是0个或多个
                for (let key in that._handlers) {
                    let arr1 = key.split("|");
                    let regex = new RegExp(arr1[0]);
                    //id通配符匹配是否通过
                    let pass = regex.test(obj.id);
                    //条件匹配是否通过
                    for (let j = 1; j < arr1.length; j++) {
                        //每个条件必须相等
                        let arr2 = arr1[j].split(":");
                        pass = pass && arr2.length == 2 && obj[arr2[0]] == arr2[1];
                    }
                    if (pass) {
                        //console.log(`regex test success, handlers key:${key},object id:${JSON.stringify(obj)}`);
                        //执行一次通配符匹配方法回调
                        that._handlers[key](obj);
                        //并指定完全匹配方法，下次进入不需要通配符匹配
                        that._handlers[obj.id] = that._handlers[key];
                    }
                }
            }
        }
    },
}