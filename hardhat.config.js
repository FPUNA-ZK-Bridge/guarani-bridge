import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

export default {
  solidity: "0.8.24",
  networks: {
    localN1: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
      mining: { auto: true, interval: 100000 },
    },
    localN2: {
      url: "http://127.0.0.1:9545",
      chainId: 1338,
    },
    // Docker networks
    dockerN1: {
      url: "http://hardhat-n1:8545",
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
      mining: { auto: true, interval: 100000 },
    },
    dockerN2: {
      url: "http://anvil-n2:9545",
      chainId: 1338,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
    },
  },
};
