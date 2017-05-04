/*global module, require*/
'use strict';

// Default Cache TTL is an hour -
// however each auth mechanism should probably set their own TTL
const CACHE_TTL = (60 * 60);
const NodeCache = require('node-cache');
const cache = new NodeCache({
    stdTTL: CACHE_TTL,
    checkperiod: 120
});

let isRedis = false;

module.exports.set = (key, val, cb) => {
    if (isRedis) {
        return cache.set(key, JSON.stringify(val), () => {
            cache.expire(key, CACHE_TTL);
            cb();
        });
    }
    return cache.set(key, val, cb);
};

module.exports.get = (key, cb) => {
    cache.get(key, (err, data) => {
        if (isRedis && data) {
            return cb(JSON.parse(data));
        } else if (data) {
            return cb(data);
        } else {
            return cb();
        }
    });
};

module.exports.test = {
    flushAll: cache.flushAll
};

module.exports.updateClient = (client, redis) => {
    cache = client;
    isRedis = redis;
};
