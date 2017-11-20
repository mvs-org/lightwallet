<p align="center">
  <a href="https://www.myetpwallet.com/">
    <img src="https://mvs.org/images/metaverselogo.png" alt="">
  </a>
</p>

# Metaverse Lightwallet

This is the Metaverse lightwallet. It is currently in beta stage and only provides basic transfer and receive functionality. Metaverse specific ETP deposit functionality will follow soon. Main focus so far is to have a wallet that does not need to download the full Metaverse blockchain. The private key gets generated and encrypted in the browser and gets never exposed to any server. Transactions get signed locally and only the signed, encoded transactions get broadcasted to the network.

## How to start it?

As this webapp is made with ionic framework we recommend you to install the ionic cli

```bash
$ sudo npm install -g ionic cordova
```

You can then just use ionic to generate a live preview.

```bash
$ ionic serve
```

## How to build it?

```bash
$ ionic cordova build browser --prod --release
```

## Contribution

We <3 our contributors! Many thanks to all supporters. We want to encourage everyone to become part of the development and support us with translations, testing and patches. If you want to help us please don't hesitate to contact us and become a part of the community.
