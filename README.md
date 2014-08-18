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

      // will mount blockchainPlugin.router at '/blockchain-bridge' in gatewayd.server
      gatewayd.plugins.register({
        plugin: blockchainPlugin,
        name: 'blockchain',
        route: '/blockchain-bridge',
      });

      // will start the worker process to get new addresses
      gatewayd.processes.register({
        newBlockchainAddresses: './node_modules/blockchain-gatewayd-plugin/processes/new_addresses.js'
      })

      ////// node_modules/blockchain-gatewayd-plugin/processes/new_addresses.js
 
      const gatewayd = require(__dirname+'/../../');

      gatewayd.plugins.blockchain.workers.newAddresses.start();

