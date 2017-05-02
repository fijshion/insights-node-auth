/*global require, module, process*/
var sync_request = require('sync-request');

module.exports.fetch = function fetch(url) {
    try {
        const tmp = process.env.NODE_TLS_REJECT_UNAUTHORIZED;

        if (url.indexOf('sso.redhat.com') === -1) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        const jsonResponse = JSON.parse(sync_request('GET', url).getBody('utf-8'));
        const pubkey = `-----BEGIN PUBLIC KEY-----\n${jsonResponse.public_key}\n-----END PUBLIC KEY-----`;

        console.log(`Using this pubkey from ${url}:\n${pubkey}`);

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = tmp;

        return pubkey;
    } catch(e) {
        console.error(e);
        console.error(`Failed to fetch pubkey from ${url} falling back to built in!`);
    }

    // on error return false, the caller is responsible for falling back
    return false;
};
