<a name="0.2.2"></a>
## 0.2.2 (2017-04-27)
### Features
- **language:** German translation ([b4614eec](https://github.com/mvs-org/lightwallet/commit/b4614eec361881a74615f976e00f1ae60cf308e5))
- **language:** Korean translation ([327070a8](https://github.com/mvs-org/lightwallet/commit/327070a8ab1efa74a74e83434e69a426f8f381b7))
- **language:** Russian translation ([7a7723b8](https://github.com/mvs-org/lightwallet/commit/7a7723b80e4febc24ac24545159cd8d74a5c62a8))
- **language:** Japanese translation ([1212d469](https://github.com/mvs-org/lightwallet/commit/1212d4696f1ae016273fca76c7d44feaec74fb97))
- **mobile:** Import wallet intro page ([2eab2044](https://github.com/mvs-org/lightwallet/commit/2eab20442b36bcff7f2b768a6b8149da70c33fe6))
- **ux:** Lazy loading ([fee4c7d2](https://github.com/mvs-org/lightwallet/commit/fee4c7d2e292ca4289aaf5e9c804c420e6d4e96e))
- **ux:** Splash screen ([949775c5](https://github.com/mvs-org/lightwallet/commit/949775c5d0678b02e7d7a9f853d558eeba0f0a8a))
- **ux:** META icon ([615aa685](https://github.com/mvs-org/lightwallet/commit/615aa685d6db11fe3afd6529ee36076cec60bdc7))
- **ux:** PARCELX.GPX icon ([e469e4ce](https://github.com/mvs-org/lightwallet/commit/e469e4cefc72e0f81ed3212531a31926f5a33380))
- **ux:** Indicate offline status ([a0d5d14f](https://github.com/mvs-org/lightwallet/commit/a0d5d14f4c228afe0f3d6fa134c24b21bb80a76c))
- **browser:** URL segments ([8ee94d03](https://github.com/mvs-org/lightwallet/commit/8ee94d033760afe6a3323284350aa04f3a1107fb))
- **browser:** Info on wallet export page ([b94c516c](https://github.com/mvs-org/lightwallet/commit/b94c516c5f585d4e557f1289ef820d86562baed0))
- **send:** Scan address from QR code scanner ([c5d764b4](https://github.com/mvs-org/lightwallet/commit/c5d764b4e217562b8fecd16d1af6e3f377768d3c))
- **send:** Error message details ([4b424826](https://github.com/mvs-org/lightwallet/commit/4b4248265afb02afa920ac0ea24ee257385b3cb8))
- **asset issue:** Error message details ([3ffc90cd](https://github.com/mvs-org/lightwallet/commit/3ffc90cd4fd82cf0b684e971e34084b103d07f28))
- **asset issue:** Supply selectable by selector ([ee8201fd](https://github.com/mvs-org/lightwallet/commit/ee8201fd583284b26c798c9598b3acd2411bd59e))
- **mobile:** Copy transaction hash after send ([85e3790b](https://github.com/mvs-org/lightwallet/commit/85e3790b289fe491cf21ec748c721df271d74fed))
- **receive:** Default select first address instead of last ([5348c675](https://github.com/mvs-org/lightwallet/commit/5348c67510bbc5287356387ed5fde700357069ca))
- **mobile:** iOS design adjustment ([e31c5fe0](https://github.com/mvs-org/lightwallet/commit/e31c5fe0bca5a0c19a790daaaeef49907e50342f))
- **send:** Send all button ([66683d54](https://github.com/mvs-org/lightwallet/commit/66683d54beaa601257206b6e96fbe45e5668451b))
### Bugfixes
- **asset issue:** Validation regex fix ([f114d250](https://github.com/mvs-org/lightwallet/commit/f114d2505b689816e15797532aabc54f1091eac6))
- **asset issue:** Create asset symbol uppercase ([88e654db](https://github.com/mvs-org/lightwallet/commit/88e654db729c304021dd0fe0a9645e434bead47e))
- **asset issue:** Error handling ([9981690d](https://github.com/mvs-org/lightwallet/commit/9981690df966cf1a581f5dc781484fcff87f7bfe))
- **core:** Prevent refresh on logout ([dc832037](https://github.com/mvs-org/lightwallet/commit/dc83203701b6925f1c4ec3f14dd959793aede580))
- **send:** Number of decimals fix ([35bedd54](https://github.com/mvs-org/lightwallet/commit/35bedd548d36bf533f905512bb22f810c3b414aa))
- **send:** Round quantity to asset precision to prevent wrong rounding ([7ac6e807](https://github.com/mvs-org/lightwallet/commit/7ac6e8074ed28af560056b6d17027ed43574f749))
- **send:** Available balance calculate include the mining fee ([fb8e4443](https://github.com/mvs-org/lightwallet/commit/fb8e444321a4bfd9a0fafdb752b7930197009249))
- **send:** Send all button only visible if balance sufficient ([eec80acd](https://github.com/mvs-org/lightwallet/commit/eec80acd682f96add901ebdd5078743354119f6a)) (Issue [#80](https://github.com/mvs-org/lightwallet/issues/80))
- **ux:** Solarized theme select color ([8ec57ac2](https://github.com/mvs-org/lightwallet/commit/8ec57ac2ef1530022a86cfb0d810900de9960cbc)) (Issue [#94](https://github.com/mvs-org/lightwallet/issues/94))
- **ux:** Update menu on logout ([aabab651](https://github.com/mvs-org/lightwallet/commit/aabab65175ef822b2160e180aef800ddee47c535))
- **network:** Prevent refresh if alrealy loading ([e0b0e3bd](https://github.com/mvs-org/lightwallet/commit/e0b0e3bd4a51c19f3bf48250422b2d98ecba636b))
- **mobile:** Transition from wallet recreation to account page ([a22a25d7](https://github.com/mvs-org/lightwallet/commit/a22a25d7e63df0d955271f2d27ba6d691680d27d))
- **mobile:** Import correct number of addresses ([6a800f69](https://github.com/mvs-org/lightwallet/commit/6a800f69547950041e69928fdb0c78a85eeaa944))
- **mobile:** Prevent landscape orientation ([8b51dbf8](https://github.com/mvs-org/lightwallet/commit/8b51dbf8e0603afdf773f48b7b2e343f8898b3c5))
- **mobile:** iPhone X fix ([1c5cb28a](https://github.com/mvs-org/lightwallet/commit/1c5cb28a7476dec81f364794741424962f6893ca))

<a name="0.2.1"></a>
## 0.2.1 (2017-12-18)
### Features
- **browser:** Wallet sync page ([2291e46e](https://github.com/mvs-org/lightwallet/commit/2291e46e04d1d9d41f7fd4795d9648840001e85f))
- **mobile:** Import wallet from QR Code ([15945b1](https://github.com/mvs-org/lightwallet/commit/15945b194d038431ed4662fab8512e3f77df7daa))
- **language:** French translation ([435188af](https://github.com/mvs-org/lightwallet/commit/435188af8744fad3c081ed5bfb945feb5bc2ce38))
- **mobile:** Drag down refresh on portfolio page ([d8b49553](https://github.com/mvs-org/lightwallet/commit/d8b49553d791e0801e4d7df042b68b2154c5e341))
- **asset issue:** Asset issue page ([c4e827cf](https://github.com/mvs-org/lightwallet/commit/c4e827cf2214f5438d4d873dfc7d280d056cc6ef))
- **asset issue:** Asset issue transaction creation ([49636d66](https://github.com/mvs-org/lightwallet/commit/49636d66899e266d6d103dc516bb72e212a640ec))
- **asset issue:** Ask for confirmation for asset creation ([21ef0e68](https://github.com/mvs-org/lightwallet/commit/21ef0e688b17b880c667da3ef79964999cdd5fa9))
- **mobile:** Logout option moved to settings ([aab15786](https://github.com/mvs-org/lightwallet/commit/aab157862729696f053c77cf3f7e6697adf79221))
- **testnet:** Introduction of testnet ([73f2b279](https://github.com/mvs-org/lightwallet/commit/73f2b279e6ef35b22106270537c93debcc10c364))
- **testnet:** Validate network on import ([fffa5c84](https://github.com/mvs-org/lightwallet/commit/fffa5c84f09796289de60a8d638374cba5fd323e))
### Bugfixes
- **cache:** Add version nuber to prevent caching ([59f34f43](https://github.com/mvs-org/lightwallet/commit/59f34f43298be534e0465f1bec8dd5f3297d8743))
- **cache:** Prevent language files from being cached after update ([7b936bb1](https://github.com/mvs-org/lightwallet/commit/7b936bb18e46be3960949fc6874f788abd34ed82))
- **theme:** Remove duplicate logo from dark theme ([e9a3fa9e](https://github.com/mvs-org/lightwallet/commit/e9a3fa9ef21bbcfc52bdd7fac000edf9392b073b))
- **send:** Only load and prepare UTXO on transaction creation ([a6ff6e83](https://github.com/mvs-org/lightwallet/commit/a6ff6e83a403792bc1d9abe27500deed02df360f))

<a name="0.1.1"></a>
## 0.1.1 (2017-12-04)
### Features
- **language:** Thai translation ([d7043fc](https://github.com/mvs-org/lightwallet/commit/d7043fc456987119070caa63adaf65a20d2e6aea))
- **deposit:** Deposit ETP option ([98a0ac7f](https://github.com/mvs-org/lightwallet/commit/98a0ac7f51634f5b661a7d68e7fac32ffc8236cb))
- **deposit:** Deposit transaction creation ([975fc732](https://github.com/mvs-org/lightwallet/commit/975fc732b367e7fd91745a4fa0c080bf5544efdd))
- **send:** Allow send to multiisig wallet address ([231e9f04](https://github.com/mvs-org/lightwallet/commit/231e9f04f3091690d5fcfa79461c3f1b91d758f9))
- **ux:** Iconset for menu ([0f490a4c](https://github.com/mvs-org/lightwallet/commit/0f490a4ca04fe90b52ca38bf554c1698d9b012f9))

<a name="0.0.1"></a>
## 0.0.1 (2017-11-20)
### Features
- **wallet:** Generate new wallet
- **security:** Encrypt wallet parameters
- **wallet:** Download wallet parameters as file
- **wallet:** Recreate wallet from file
- **send:** Send ETP
- **receive:** Show addresses
- **receive:** Receive ETP
