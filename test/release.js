describe('release', function() {
  var redis = require('redis');
  var singleWorker = require('../');

  var worker1;
  var worker2;

  beforeEach(function(done) {
    redis.createClient().flushdb(done);
  });

  beforeEach(function() {
    worker1 = singleWorker('singleton worker release test');
    worker2 = singleWorker('singleton worker release test');
    worker1.lock();
    worker2.lock();
  });

  afterEach(function(done) {
    worker1.release();
    worker1.end();
    worker1.on('release', function() {
      worker2.release();
      worker2.end();
      worker2.on('release', done);
    });
  });

  it('worker 1 receives a lock event', function(done) {
    worker1.on('lock', done);
  });

  it('worker 2 receives a conflict event', function(done) {
    worker2.on('conflict', done);
  });

  describe('when worker 1 releases his lock', function() {
    beforeEach(function(done) {
      worker1.release();
      worker1.once('release', done);
    });

    it('worker2 get a lock event', function(done) {
      worker2.on('lock', done);
    });
  });
});