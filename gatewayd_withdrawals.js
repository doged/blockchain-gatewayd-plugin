var request = require("superagent");
var config = require(__dirname+'/config/config.js');
var async = require('async');
var SqlMqWorker = require('sql-mq-worker');

//if (process.env.NODE_ENV != 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//}

loopAndProcessWithdrawal(loopAndProcessWithdrawal);

function loopAndProcessWithdrawal(callback) {
	async.waterfall([
    function(next) {
			getWithdrawal(next);
    },
		function(withdrawal, next) {
			getWithdrawalAddress(withdrawal.external_account_id, function(error, externalAccount){
        if (error) {
					console.log('getWithdrawalAddress::error', error);
          next(error, null);
				} else {
					console.log('getWithdrawalAddress::address', externalAccount);
					next(null, withdrawal, externalAccount);
				}
			});
		},
    function(withdrawal, externalAccount, next) {
			sendDogecoins({
				amount: withdrawal.amount,
				address: externalAccount.uid
			}, function(error, response) {
				next(error, withdrawal);
      });
    },
    function(withdrawal, next) {
			clearWithdrawal(withdrawal, next);
    }
	], function(error, clearedWithdrawal) {
		setTimeout(function() {
			callback(callback);
		}, 2000);
	});
}

function getWithdrawal(callback) {
  request 
    .get(config.get('gatewaydDomain')+'/v1/withdrawals')
    .auth(config.get('adminEmail'), config.get('apiKey'))
    .end(function(error, response) {
      if (error) {
        callback(error, null); 
      } else {
				var withdrawal = response.body.withdrawals[0];
				if (withdrawal) {
					callback(null, withdrawal); 
				} else {
					callback('no withdrawals', null); 
				}
      }
    });
}

function getWithdrawalAddress(externalAccountId, callback) {
  request 
    .get(config.get('gatewaydDomain')+'/v1/external_accounts/'+externalAccountId)
    .auth(config.get('adminEmail'), config.get('apiKey'))
    .end(function(error, response) {
			if (error) {
				callback(error, null);
			} else {
				console.log('getWithdrawalAddress::response', response.body);
				callback(null, response.body.external_account);	
			}
		});
};

function sendDogecoins(options,  callback){
  var url = config.get('dogecoinExpressDomain')+'/v1/sendtoaddress/'+options.address+'/'+options.amount;
  console.log('send dogecoins', url);
  request
    .post(url)
    .auth('admin', config.get('dogecoinExpressApiKey'))
    .send({})
    .end(function(error, response){
      console.log('SENT DOGECOINS', response.body);
      console.log('SEND DOGECOINS ERROR', error);
      callback(error, response.body.address, options.withdrawal);
    });
}

function clearWithdrawal(withdrawal, callback) {
  var url = config.get('gatewaydDomain')+'/v1/withdrawals/'+withdrawal.id+'/clear';
  console.log('clearWithdrawal', url);
  request
    .post(url)
    .auth(config.get('adminEmail'), config.get('apiKey'))
    .send({})
    .end(function(error, response){
      console.log('withdrawal::clear::success', response.body);
      console.log('withdrawal::clear::error', response.error);
      callback(error, response);
    });
}

