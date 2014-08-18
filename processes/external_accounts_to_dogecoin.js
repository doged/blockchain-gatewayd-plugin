const request = require("superagent");
const config = require(__dirname+'/../config/config.js');
const gatewayd = require(__dirname+'/../../gatewayd/');
const QueueWorker = require('sql-mq-worker');
const blockchain =  require('blockchain-monitor');

const blockchainClient = new blockchain.Client({

});

if (process.env.NODE_ENV != 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const worker = new QueueWorker({
  Class: gatewayd.data.models.externalAccounts,
  predicate: { where: {
    name: 'default'
  }},
  job: function(externalAccount, next) {
    blockchainClient.getNewAddress(function(error, address) {
      if (error) {
        console.log('ERROR', error);
        return next();
      }
      externalAccount.updateAttributes({
        name: address
      }).complete(function(error, externalAccount) {
        if (error) {
          console.log('ERROR', error);
        } else {
          console.log('UPDATED', externalAccount);
        }
        next();
      });
    });
  }
});

worker.start();

