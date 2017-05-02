/*global require, module*/
'use strict';

const Mechanism       = require('./mechanism');
const request         = require('request');
const crypto          = require('crypto');
const lodash          = require('lodash');
const basicAuthRegexp = /^[Bb]asic (.*)/;

class StrataBasicAuth extends Mechanism {
    buildUserObject(data) {
        const json = JSON.parse(data);
        return {
            account_number: json.account_number,
            org_id: json.org_id,
            email: json.email,
            locale: json.locale,
            is_active: json.is_active,
            is_org_admin: json.org_admin,
            is_internal: lodash.find(json.rights.right, { name: 'redhat:employees', role: [ 'User' ] }) ? true : false,
            sso_username: json.sso_username
        };
    }

    getCacheKey(creds) {
        return crypto.createHash('sha512').update(creds).digest('base64');
    }

    ensureCredentials(creds) {
        if (!creds) {
            throw new Error('No Authorization header exists');
        }

        if (!basicAuthRegexp.test(creds)) {
            throw new Error('Invalid basic auth authorization header value');
        }
    }

    getCreds() {
        return this.req.get('authorization');
    }

    doRemoteCall(creds, callback) {
        const instance = this;
        request(instance.getOpts(creds), (err, res, body) => {

            if (err) {
                return instance.fail(`Got a request error ${instance.name}: ${err}`);
            }

            if (res && res.statusCode !== 200) {
                return instance.fail(`Got a bad statusCode from ${instance.name}: ${res.statusCode}`);
            }

            return callback(body);
        });
    }

    getOpts(creds) {
        return {
            uri: this.config.strataAuthUrl,
            strictSSL: this.config.requestOptions.strictSSL,
            headers: {
                accept: 'application/vnd.redhat.user+json',
                authorization: creds
            }
        };
    }
};

module.exports = StrataBasicAuth;
