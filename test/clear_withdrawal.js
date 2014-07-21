var http = require('superagent');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

describe('clearing a withdrawal', function() {
  it('should post to gatewayd', function(done) {
    http 
			.post('https://ec2-50-17-39-241.compute-1.amazonaws.com/v1/withdrawals/10/clear')
      .auth('admin@doge-gate.com', 'b8fb8959f02f072c57c1ac6191f7adfd06624c3df68ef5f8cbcb73cca8cac4d6')
      .send({})
      .end(function(error, response) {
				console.log('error', error);
        console.log('response', response);
				done();
			});
  });
});
