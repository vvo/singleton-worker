module.exports = singleWorker;

function singleWorker(name, opts) {
  return new SingleWorker(name, opts);
}

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Locky = require('locky');
var merge = require('lodash').merge;
var uuid = require('uuid');

function SingleWorker(name, opts) {
  EventEmitter.call(this);
  this.name = name;

  opts = merge({
    redis: {
      host: '127.0.0.1',
      port: 6379
    },
    ttl: 5 * 1000
  }, opts || {});

  this._opts = opts;
  this._id = uuid.v4();
  this._locky = new Locky(opts);
}

util.inherits(SingleWorker, EventEmitter);

SingleWorker.prototype.lock = function lock(/* looping */) {
  var looping = arguments[0];

  this._locky.lock({
    resource: this.name,
    locker: this._id
  }, locked.bind(this));

  function locked(err, gotLock) {
    if (err) {
      return this.emit('error', err);
    }

    if (gotLock === false) {
      if (!looping) {
        this.emit('conflict');
      }
      this._lockLoop = setTimeout(this.lock.bind(this), this._opts.ttl / 2, true);
      return;
    }

    // to keep the lock, we only have to
    // refresh it
    refreshLoop.call(this);

    this.emit('lock');
  }

  function refreshLoop() {
    this._lockLoop = setTimeout(refresh.bind(this), this._opts.ttl / 2);
  }

  function refresh() {
    this._locky.refresh(this.name, refreshDone.bind(this));

    function refreshDone(err) {
      if (err) {
        return this.emit('error', err);
      }

      refreshLoop.call(this);
    }
  }
}

SingleWorker.prototype.release = function release() {
  this._locky.unlock(this.name, released.bind(this));

  function released(err) {
  if (err) {
      return this.emit('error', err);
    }

    this.emit('release');
  }
}

SingleWorker.prototype.end = function end(cb) {
  clearTimeout(this._lockLoop);
  this._locky.close(cb);
};