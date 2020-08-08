# petshop
## pet-shop
⊕ [Ethereum Pet Shop -- Your First Dapp | Tutorials | Truffle Suite](https://www.trufflesuite.com/tutorials/pet-shop)

```sh
$ node -v
v10.16.3

npm install -g truffle
mkdir pet-shop-tutorial
cd pet-shop-tutorial
truffle unbox pet-shop
# Create a new file named Adoption.sol in the contracts/ directory.

truffle compile

# Create a new file named 2_deploy_contracts.js in the migrations/ directory.

# $ ganache-cli -p 7545
$ ganache-cli

truffle migrate

# Create a new file named TestAdoption.sol in the test/ directory.
# https://github.com/trufflesuite/truffle/blob/master/packages/core/lib/testing/Assert.sol

truffle test

# Included with the pet-shop Truffle Box was code for the app's front-end. That code exists within the src/ directory.

```

+ /src/js/app.js
    * https://www.trufflesuite.com/tutorials/pet-shop#creating-a-user-interface-to-interact-with-the-smart-contract

```sh
# “新网络”: http://127.0.0.1:7545
# 已经修改了示例, 可直接用localhost:8545
npm run dev
```
