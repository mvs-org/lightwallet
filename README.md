![Metaverse Logo](https://raw.githubusercontent.com/mvs-org/lightwallet/master/src/assets/logo.png)
# MyETPWallet
This is the Metaverse lightwallet. Main focus so far is to have a wallet that does not need to download the full Metaverse blockchain. The private key gets generated and encrypted in the browser and gets never exposed to any server. Transactions get signed locally and only the signed, encoded transactions get broadcasted to the network. The lightwallet can also be build as a mobile app as well as a browser extension.

## Install Dependencies
As this webapp is made with ionic framework you should install the ionic cli as well as the other npm dependencies.
```bash
npm install -g ionic
npm install
```

## How to start it?
You can then just use ionic to generate a live preview.
```
ionic serve
```
Or on your android phone. Make sure you have an android development environment with build-tools and sdk with accepted licenses.
```
ionic capacitor copy android && cd android && ./gradlew assembleDebug && ./gradlew installDebug && cd ..
```

## How to build it?

```
ionic build --engine=browser --prod
```

To build it for Android you can use this command:
```
ionic capacitor build android --prod
```

## Contribution

We <3 our contributors! Many thanks to all supporters. We want to encourage everyone to become part of the development and support us with translations, testing and patches. If you want to help us please don't hesitate to contact us and become a part of the community.

## License

Copyright (C) 2020  Metaverse Foundation

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.