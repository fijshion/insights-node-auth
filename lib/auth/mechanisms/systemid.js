/*global module, require, process*/
'use strict';

const Mechanism        = require('./mechanism');
const request          = require('request');
const lodash           = require('lodash');
const systemIdPropsArr = ['header', 'url', 'method'];
const crypto           = require('crypto');
const parseString      = require('xml2js').parseString;
const checkedEnv       = require('./common/utils').checkEnv('SYSTEMIDAUTH', systemIdPropsArr);
const missingProps     = checkedEnv.missing;
const systemIdConfig   = checkedEnv.config;
const priv             = {};

class SystemIdAuth extends Mechanism {
    constructor(req, deferred) {
        super(req, deferred);
        this.systemIdConfig = systemIdConfig;

        if (missingProps.length > 0) {
            missingProps.forEach((prop) => {
                this.logger(`Missing prop: ${prop}`);
            }, this);
            throw new Error('SystemIdAuth configuration not setup!');
        }
    }

    buildUserObject(account_number) {
        return {
            is_active: true,
            is_entitled: true,
            is_org_admin: false,
            is_internal: false,
            sso_username: `systemid-system-${account_number}`,
            account_number: account_number
        };
    }

    getCacheKey(creds) {
        return crypto.createHash('sha512').update(creds.systemid).digest('base64');
    }

    ensureCredentials(creds) {
        if (!creds) {
            throw new Error('Error getting headers');
        }

        if (!creds.systemid) {
            throw new Error('No System ID');
        }
    }

    getCreds() {
        return {
            systemid: this.req.headers[this.systemIdConfig.header]
        };
    }

    getOpts(creds) {
        return {
            method: 'POST',
            headers: {
                'content-type': 'text/xml',
                'user-agent': 'access-insights-auth'
            },
            uri: this.systemIdConfig.url,
            body: priv.buildXml(this.systemIdConfig, creds.systemid)
        };
    }

    doRemoteCall(creds, callback) {
        const instance = this;

        request(instance.getOpts(creds), (err, res, body) => {
            if (err) {
                return instance.fail(`Got a request error ${instance.name}: ${err}`);
            }

            if (res.statusCode !== 200) {
                this.logger(body);
                return instance.fail(`Got a bad statusCode from rhn: ${res.statusCode}`);
            }

            // explicitArray: true puts everything in an array, even if there is one element
            // makes the below check far nastier than it already is.
            parseString(body, {
                explicitArray: false
            }, (err, result) => {
                const accountNumber = lodash.get(result, 'methodResponse.params.param.value.int');
                if (accountNumber) {
                    callback(accountNumber);
                } else {
                    instance.fail('Could not locate account number from xml response');
                }
            });

            return true;
        });
    }
}

priv.encodeHTML = (str) => {
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

priv.buildXml = (config, systemid) => {
    return `<?xml version=\'1.0\'?>
<methodCall>
  <methodName>${config.method}</methodName>
  <params>
    <param>
      <value>
       <string>${priv.encodeHTML(systemid)}</string>
      </value>
    </param>
  </params>
</methodCall>`;
};

module.exports = SystemIdAuth;
