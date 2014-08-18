## Blockchain Gatewayd Plugin

### Installation

    npm install --save blockchain-gatewayd-plugin

### Usage

In the Gatewaydfile.js of your gatewayd installation

      const BlockchainPlugin = require('blockchain-gatewayd-plugin');
      const BlockchainClient = require('blockchain-monitor').Client;

      const blockchainPlugin = new BlockchainPlugin({
        gatewayd: gatewayd,
        blockchainClient: new BlockchainClient({
          host: '127.0.0.1',
          port: 22555,
          https: false,
          user: 'rpcUser',
          pass: 'rpcPassword',
          type: 'dogecoin'
        })
      }); 

      gatewayd.server.use('/', blockchainPlugin);

