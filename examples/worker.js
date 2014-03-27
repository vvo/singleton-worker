var debug = require('debug')('worker ' + process.pid);
var worker = require('../')('example worker', {
  ttl: 1000
});

debug('booting');

worker.lock();
worker.on('lock', function started() {
  debug('I am the main process');
});

worker.on('conflict', function conflicted() {
  debug('I am not the main process');
});