<p align="center">
  <a href="https://www.myetpwallet.com/">
    <img src="https://mvs.org/images/metaverselogo.png" alt="">
  </a>
  <br>
  <a href="https://travis-ci.org/mvs-org/lightwallet">
     <img src="https://travis-ci.org/mvs-org/lightwallet.svg?branch=dev" alt="Build status">
  </a>
</p>

This is the Metaverse lightwallet. Main focus so far is to have a wallet that does not need to download the full Metaverse blockchain. The private key gets generated and encrypted in the browser and gets never exposed to any server. Transactions get signed locally and only the signed, encoded transactions get broadcasted to the network. The lightwallet can also be build as a mobile app.

## How to start it?

As this webapp is made with ionic framework we recommend you to install the ionic cli

```bash
$ sudo npm install -g ionic
```

You can then just use ionic to generate a live preview.

```bash
$ ionic serve
```

Or on your android phone. Make sure you have an android development environment with build-tools and sdk with accepted licenses.


```bash
$ ionic cordova run android --prod --device
```

## How to build it?

```bash
$ ionic cordova build browser --prod --release
```

To build it for android use the following command. 

```bash
$ ionic cordova build --release --prod android
```

## Configuration

By default the configuration should be set to use the testnet. This is the best way for development and testing and you should only switch to mainnet if you really have to. In order to change the setting you can find it in src/app/app.global.ts. If you need testnet tokens you can download the fullnode wallet, start it in testnet mode and mine coins yourself or contact us on our common channels.

## Contribution

We <3 our contributors! Many thanks to all supporters. We want to encourage everyone to become part of the development and support us with translations, testing and patches. If you want to help us please don't hesitate to contact us and become a part of the community.
