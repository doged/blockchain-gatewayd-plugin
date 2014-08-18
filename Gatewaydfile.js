const DogecoinPlugin = require('dogecoin-gatewayd-plugin');

module.exports = function(gatewayd) {
  
  const dogecoinPlugin = new DogecoinPlugin({
    gatewayd: gatewayd
  }); 

  gatewayd.server.use('/', dogecoinPlugin);
 
}

