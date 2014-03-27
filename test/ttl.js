describe('ttl', function() {
  var redis = require('redis');
  var singleWorker = require('../');

  var worker1;
  var worker2;

  beforeEach(function(done) {
    redis.createClient().flushdb(done);
  });

  beforeEach(function() {
    worker1 = singleWorker('singleton worker ttl test', {
      ttl: 500
    });
    worker2 = singleWorker('singleton worker ttl test', {
      ttl: 500
    });
  });

  afterEach(function(done) {
    worker2.end(done);
  });

  it('worker2 get a lock event after a while', function(done) {
    worker1.lock();
    worker2.lock();
    worker1.on('lock', function() {
      worker1.end();
      worker2.on('lock', done);
    });
  });
});