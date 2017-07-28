/*global require, module, process*/
var sync_request = require('sync-request');
const debug  = require('debug')('auth');

module.exports.fetch = function fetch() {
    const tmp = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    const url = process.env.JWT_PUBKEY_URL || 'https://sso.redhat.com/auth/realms/redhat-external';
    try {
        if (url.indexOf('sso.redhat.com') === -1) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        const jsonResponse = JSON.parse(sync_request('GET', url, {
            headers: {
                'x-rhi-phxproxytoken': process.env.PHXPROXY_TOKEN
            }
        }).getBody('utf-8'));
        const pubkey = `-----BEGIN PUBLIC KEY-----\n${jsonResponse.public_key}\n-----END PUBLIC KEY-----`;

        debug(`Using this pubkey from ${url}:\n${pubkey}`);

        return pubkey;
    } catch(e) {
        console.error(e);
        console.error(`Failed to fetch pubkey from ${url} falling back to built in!`);
    } finally {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = tmp;
    }

    // on error return false, the caller is responsible for falling back
    return false;
};
