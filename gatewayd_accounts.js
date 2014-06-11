var request = require("superagent");
var config = require(__dirname+'/config/config.js');

if (process.env.NODE_ENV != 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

loopAndSetNewGatewayExternalAccount(loopAndSetNewGatewayExternalAccount);

function loopAndSetNewGatewayExternalAccount(callback) {
  getNewGatewayAccount(function(error, gatewayExternalAccount) {
    if (error) {
      console.log('ERROR', error);
      callback(callback);
    } else if (gatewayExternalAccount) {
      setDogecoinAddress(gatewayExternalAccount.id, function(error, gatewayExternalAccount){
        if (error) {
          callback(callback);
          console.log('ERROR', error);
        } else {
          console.log('UPDATED', gatewayExternalAccount);
          callback(callback);
        }  
      });
    } else {
      callback(callback);
    }
  });
}

function getNewGatewayAccount(callback) {
  request 
    .get(config.get('gatewaydDomain')+'/v1/external_accounts?name=default')
    .auth(config.get('adminEmail'), config.get('apiKey'))
    .end(function(error, response) {
      if (error) {
        callback(error, null); 
      } else {
        try { 
          var account = response.body.external_accounts[0];
          callback(null, account);
        } catch(error) {
          callback(error, null); 
        }
      }
    });
}

function getNewDogecoinAddress(callback){
  request
    .get(config.get('dogecoinExpressDomain')+'/v1/getnewaddress')
    .auth('admin', config.get('dogecoinExpressApiKey'))
    .end(function(error, response){
      callback(error, response.body.address);
    });
}

function setDogecoinAddress(externalAccountId, callback) {
  getNewDogecoinAddress(function(error, dogecoinAddress){
    request
      .put(config.get('gatewaydDomain')+'/v1/external_accounts/'+externalAccountId)
      .send({ name: dogecoinAddress })
      .auth(config.get('adminEmail'), config.get('apiKey'))
      .end(function(error, response) {
        if (error) {
          callback(error, null); 
        } else {
          console.log(error, response.body);
          callback(null, response.body.external_account);
        }
      });
  });
}

