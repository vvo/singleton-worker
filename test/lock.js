describe('lock', function() {
  var redis = require('redis');
  var singleWorker = require('../');

  beforeEach(function(done) {
    redis.createClient().flushdb(done);
  });

  var worker;

  beforeEach(function() {
    worker = singleWorker('singleton worker lock test');
    worker.lock();
  });

  afterEach(function(done) {
    worker.release();
    worker.end();
    worker.once('release', done);
  });

  it('receives a lock event', function(done) {
    worker.once('lock', done);
  });
});