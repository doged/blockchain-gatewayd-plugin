## Dogecoin Gatewayd Plugin

## Installation

    npm install --save blockchain-monitor

## Usage

    const blockchain = require('blockchain-monitor');

    blockchainPoller = new blockchain.Poller({
      lastBlockHash: config.get('lastBlockHash'),
      blockchainClient:  new blockchain.Client()
    });

    blockchainPoller.pollForBlocks(function(block, next) {
      block.forEach(transaction, function(transaction) {
        sendTextMessageAlert(transaction);  // do something with the transaction
      });
      next(); // proceed to the next block of transactions
    });

Three unix processes designed to automate the integration between a ripple gateway using gatewayd and a dogecoind server.

- Process 1: `gatewayd_accounts.js`

Whenever a new external_account record is created in gatewayd, this process generates a new Dogecoin address and appends it to the external_account, replacing the default name

- Process 2:  `get_next_payment.js`

Periodically poll Dogecoin for new payments made to the Dogecoind server's wallet

- Process 3: `gatewayd_withdrawals.js`

When a new withdrawal record (external_transaction with "deposit"=false) is created, send a corresponding amount to the recipient dogecoin address using Dogeoind and clear the withdrawal

