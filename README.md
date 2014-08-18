## Dogecoin Gatewayd Plugin

### Installation

    npm install --save dogecoin-gatewayd-plugin

### Usage

In the Gatewaydfile.js of your gatewayd installation

      const dogecoinPlugin = new DogecoinPlugin({
        gatewayd: gatewayd
      }); 

      gatewayd.server.use('/', dogecoinPlugin);

