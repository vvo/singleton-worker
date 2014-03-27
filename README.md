# singleton worker

Run a process accross multiple machines.

[![Build Status](https://travis-ci.org/vvo/singleton-worker.svg?branch=master)](https://travis-ci.org/vvo/singleton-worker)
[![Dependency Status](https://david-dm.org/vvo/singleton-worker.svg?theme=shields.io)](https://david-dm.org/vvo/singleton-worker)
[![devDependency Status](https://david-dm.org/vvo/singleton-worker/dev-status.svg?theme=shields.io)](https://david-dm.org/vvo/singleton-worker#info=devDependencies)

# options

```js
var worker = require('singleton-worker')('process name', {
  ttl: 5 * 1000,
  redis: {
    port: '6379',
    host: '127.0.01'
  }
});
```

* ttl: when process exits without releasing the lock,
  how much time to wait to release the lock
* redis: follows [node-redis.createClient](https://github.com/mranney/node_redis#rediscreateclientport-host-options).

# API

## worker.lock();

Try to get a lock for this worker.

## worker.release();

Release the lock for the current worker.

## worker.end();

Stop (without releasing) worker redis connection.
It's up to you to release the worker before end.

## worker.on('lock');

Emitted when the worker managed to get the lock as a master.

## worker.on('conflict');

Emitted when another worker already had the lock.

## worker.on('release');

Emitted when the worker released his lock

## worker.on('error');

# inspiration

Most of the API design comes from
[twistedstream/singleton-process](https://github.com/twistedstream/singleton-process/).
