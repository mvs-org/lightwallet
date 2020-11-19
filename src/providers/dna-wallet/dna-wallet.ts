import { Injectable } from '@angular/core';
import { PrivateKey, PublicKey, Signature, key } from 'bitsharesjs'
import * as bip39 from 'bip39'

@Injectable()
export class DnaWalletProvider {
    // 生成钱包
    static async generateWallet(net, mnemonic) {
        return new Promise((resolve, reject) => {
            // 针对不同的网络使用不同的方式生成公私钥对
            if (net == 'bts') {
                resolve(generateBTSKeyPair(mnemonic))
            }
            else if (net == 'sub') {
                resolve(generateSUBKeyPair(mnemonic))
            }
            else {
                let e = 'unknown net'
                reject(e)
            }
        })
    }

    // 助记词验证
    static isMnemonicLegal(mnemonic) {
        return bip39.validateMnemonic(mnemonic)
    }

    static isPublicKey(str) {
        try {
            PublicKey.fromStringOrThrow(str);
            return true;
        } catch (err) {
            return false;
        }
    }

    // 根据已知助记词生成密钥信息
    static getAccountInfo(mnemonic, net) {
        let res = {}
        if (net == 'bts') {
            let pkey = PrivateKey.fromSeed(key.normalize_brainKey(mnemonic))
            res = {
                mnemonic,
                privateKey: pkey,
                publicKey: pkey.toPublicKey().toString('DNA')
            }
        }
        if (net == 'sub') {
            // sub助记词密钥导入处理
            //   let kr = new Keyring()
            //   let pair = kr.addFromMnemonic(mnemonic)
            //   res = {
            //     mnemonic,
            //     privateKey: mnemonic,
            //     publicKey: u8aToHex(pair.publicKey),
            //     address: pair.address
            //   }
        }
        return res
    }

    /**
     * 数据签名
     * @param {*} private_key
     * @param {*} chain_id_hex
     * @param {*} data_hex
     */
    static sign(private_key, public_key, data_buff) {
        var sig = Signature.signBuffer(
            data_buff,
            private_key,
            public_key
        );
        return sig
    }
}

// 生成bts密钥对
// TODO: BTS格式已确定，所有涉及的地方需要重新处理
function generateBTSKeyPair(mnemonic) {
    mnemonic = mnemonic ? mnemonic : bip39.generateMnemonic(256)

    let seed = mnemonic
    let pkey = PrivateKey.fromSeed(key.normalize_brainKey(seed))
    // 构造对象
    let res = {
        mnemonic,
        privateKey: pkey.toHex(),
        publicKey: pkey.toPublicKey().toPublicKeyString('DNA')
    }
    return res
}

// 生成sub密钥对
async function generateSUBKeyPair(mnemonic) {
    return {}
    // let mnemonic = subUtil.mnemonicGenerate(24)
    // let kr = new Keyring()
    // let keyPair = kr.addFromMnemonic(mnemonic)
    // // 构造对象
    // // sub的助记词视作私钥
    // let res = {
    //   mnemonic,
    //   privateKey: mnemonic,
    //   publicKey: u8aToHex(keyPair.publicKey),
    //   address: keyPair.address
    // }
    // return res
}