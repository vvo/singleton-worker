describe('conflict', function() {
  var redis = require('redis');
  var singleWorker = require('../');

  var worker1;
  var worker2;

  beforeEach(function(done) {
    redis.createClient().flushdb(done);
  });

  beforeEach(function() {
    worker1 = singleWorker('singleton worker conflict test');
    worker2 = singleWorker('singleton worker conflict test');
    worker1.lock();
    worker2.lock();
  });

  afterEach(function(done) {
    worker1.release();
    worker1.end();
    worker1.once('release', function() {
      worker2.release();
      worker2.end();
      worker2.once('release', done);
    });
  });

  it('worker 1 receives a lock event', function(done) {
    worker1.once('lock', done);
  });

  it('worker 2 receives a conflict event', function(done) {
    worker2.once('conflict', done);
  });
});