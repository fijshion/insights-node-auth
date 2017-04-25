/*global require, module*/
'use strict';

const Mechanism = require('./mechanism');
const jwt       = require('jsonwebtoken');
const lodash    = require('lodash');
const pubkey    = require('../config').ssoPubKey;

class KeycloakJwtAuth extends Mechanism {
    constructor(req, deferred) {
        super(req, deferred);
        this.shouldCache = false;
    }

    buildUserObject(data) {
        return {
            account_number: String(data.account_number),
            org_id: String(data.account_id),
            email: data.email,
            locale: data.lang,

            // Not 100% sure about this one
            // I know authenticated means they paid for sure
            // But it might not mean is_active
            // Asking jcain about it
            is_active: lodash.includes(data.realm_access.roles, 'authenticated'),
            is_org_admin: lodash.includes(data.realm_access.roles, 'admin:org:all'),
            is_internal: lodash.includes(data.realm_access.roles, 'redhat:employees'),
            sso_username: data.username
        };
    }

    getCacheKey() {
        return false;
    }

    ensureCredentials(creds) {
        if (!creds) {
            throw new Error('No JWT cookie data exists');
        }
    }

    getCreds() {
        return this.req.cookies.rh_jwt;
    }

    doRemoteCall(creds, callback) {
        const instance = this;
        jwt.verify(creds, pubkey, {}, function jwtVerifyPromise(err, decoded) {
            if (err) { return instance.fail(`No username found in JWT: ${err}`); }
            decoded.DONT_CACHE = true;
            return callback(decoded);
        });
    }
};

module.exports = KeycloakJwtAuth;


