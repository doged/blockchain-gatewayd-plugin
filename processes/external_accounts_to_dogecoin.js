vr request = require("superagent");
var config = require(__dirname+'/../config/config.js');
var gatewayd = require(__dirname+'/../../gatewayd/');
var QueueWorker = require('sql-mq-worker');

if (process.env.NODE_ENV != 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

var worker = new QueueWorker({
  Class: gatewayd.data.models.externalAccounts,
  predicate: {
    name: 'default'
  },
  job: function(externalAccount, next) {
    console.log('found new external account', externalAccount);
    getNewDogecoinAddress(function(error, address) {
      if (error) {
        console.log('ERROR', error);
        next();
      } else {
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
      }  
    });
  }
})

function getNewDogecoinAddress(callback){
  request
    .get(config.get('dogecoinExpressDomain')+'/v1/getnewaddress')
    .auth('admin', config.get('dogecoinExpressApiKey'))
    .end(function(error, response){
      callback(error, response.body.address);
    });
}
