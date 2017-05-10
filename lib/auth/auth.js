/*global module, require, process*/
'use strict';

const Q     = require('q');
const debug = require('debug')('auth');

module.exports.smwBasic          = require('./mechanisms/smw-basic');
module.exports.strataBasic       = require('./mechanisms/strata-basic');
module.exports.keycloakJwt       = require('./mechanisms/keycloak-jwt');
module.exports.cert              = require('./mechanisms/cert');
module.exports.systemid          = require('./mechanisms/systemid');
module.exports.config            = require('./config');
module.exports.updateCacheClient = (client) => {
    require('./cache').updateClient(client, true);
};

module.exports.execChain = (app, mechanisms, deferred) => {
    mechanisms.forEach((passedInMechanism, i) => {

        if (!passedInMechanism) {
            throw new Error(`Invalid auth mechanism passed in: ${passedInMechanism}`);
        }

        app.use((req, res, next) => {
            const mechanism = new passedInMechanism(req, Q.defer());
            debug(`doing ${mechanism.name}`);

            mechanism.tryAuth().then((ret) => {
                if (ret.user === false) {
                    debug(`${mechanism.name}: failed`);
                    if (i === (mechanisms.length - 1)) {
                        debug(`${mechanism.name} was the last mechanism... giving up now`);
                        if (deferred) {
                            deferred.reject(401);
                        }
                        return res.status(401).end();
                    }
                    return next();
                }

                if (ret.user !== mechanism.skipValue) {
                    ret.user.mechanism = mechanism.name;
                    req.authorized = ret.user;
                }

                if (deferred) {
                    deferred.resolve(ret.user);
                }

                debug(ret.user);

                return next();
            }).catch((e) => {
                debug(`While running execChain with mechanism ${mechanism.name} caught ${e}`);
            });
        });
    });
};
