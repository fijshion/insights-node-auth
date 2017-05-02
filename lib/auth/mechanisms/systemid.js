/*global module, require, process*/
'use strict';

const Mechanism = require('./mechanism');
const request = require('request');
const systemIdPropsArr = ['header', 'url', 'method'];
const missingProps = [];
const crypto = require('crypto');
const parseString = require('xml2js').parseString;
const priv = {};
const systemIdConfig = {};

systemIdPropsArr.forEach((prop) => {
    const envName = 'SYSTEMIDAUTH_' + prop.toUpperCase();
    const envProp = process.env[envName];

    if (!envProp || envProp.trim() === '') {
        missingProps.push(envName);
    }
    systemIdConfig[prop] = envProp;
});

class SystemId extends Mechanism {
    constructor(req, deferred) {
        super(req, deferred);
        this.systemIdConfig = systemIdConfig;

        if (missingProps.length > 0) {
            missingProps.forEach((prop) => {
                this.logger('Missing prop: ' + prop);
            }, this);
            throw Error('SystemIdAuth configuration not setup!');
        }
    }

    buildUserObject(account_number) {
        return {
            is_active: true,
            is_entitled: true,
            sso_username: 'systemid-system-' + account_number,
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

    doRemoteCall(creds, callback) {
        const instance = this;
        request({
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml'
            },
            uri: this.systemIdConfig.url,
            body: priv.buildXml(this.systemIdConfig, creds.systemid)
        }, (err, res, body) => {
            if (res.statusCode !== 200) {
                return instance.fail('Got a bad statusCode from rhn: ' + res.statusCode);
            }
            // explicitArray: true puts everything in an array, even if there is one element
            // makes the below check far nastier than it already is.
            parseString(body, {
                explicitArray: false
            }, (err, result) => {
                // Yucky.
                if (result && result.methodResponse &&
                    result.methodResponse.params &&
                    result.methodResponse.params.param &&
                    result.methodResponse.params.param.value &&
                    result.methodResponse.params.param.value.int) {
                    callback(result.methodResponse.params.param.value.int);
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
  <methodName>
      ${config.method}
  </methodName>
  <params>
    <param>
      <value>
       <string>
         ${priv.encodeHTML(systemid)}
       </string>
      </value>
    </param>
  </params>
</methodCall>`;
};

module.exports = SystemId;
