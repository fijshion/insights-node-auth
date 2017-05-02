/*global require, module*/
'use strict';

const Mechanism = require('./strata-basic'); // note this extends strata-basic not Mechanism
const request   = require('request');
const lodash    = require('lodash');
const basicAuth = require('basic-auth');

class SmwBasicAuth extends Mechanism {
    buildUserObject(json) {
        return {
            account_number: String(json.customer.oracleCustomerNumber),
            org_id: String(json.customer.id),
            email: json.personalInfo.email,
            locale: json.personalInfo.locale,
            is_active: json.active,
            is_org_admin: lodash.find(json.roles, { group: 'admin:org:all', roles: [ 'ADMIN' ] }) ? true : false,
            is_internal: lodash.find(json.roles, { group: 'redhat:employees', roles: [ 'USER' ] }) ? true : false,
            sso_username: json.login
        };
    }

    ensureCredentials(creds) {
        if (!this.req.get('authorization')) {
            throw new Error('No Authorization header exists');
        }

        if (!creds) {
            throw new Error('Could not decode credentials from authorization header');
        }
    }

    getCreds() {
        const tmp = basicAuth.parse(this.req.get('authorization'));
        if (!tmp) {
            return false;
        }

        return {
            login: tmp.name,
            password: tmp.pass
        };
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

            return request(instance.getOptsRoles(body.login), (err, res, rolesBody) => {
                body.roles = rolesBody;
                callback(body);
            });
        });
    }

    getOptsRoles(login) {
        return {
            uri: `${this.config.middlewareHost}/svcrest/group/membership/login=${login}`,
            strictSSL: this.config.requestOptions.strictSSL,
            json: true,
            headers: {
                'user-agent': 'access-insights-auth'
            }
        };
    }

    getOpts(creds) {
        return {
            uri: `${this.config.middlewareHost}/svcrest/user/v3/verifyPwd`,
            strictSSL: this.config.requestOptions.strictSSL,
            method: 'POST',
            body: creds,
            json: true,
            headers: {
                'content-type': 'application/json',
                'user-agent': 'access-insights-auth'
            }
        };
    }
};

module.exports = SmwBasicAuth;
