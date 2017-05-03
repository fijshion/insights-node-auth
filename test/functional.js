/*global require, process, describe, it, before, beforeEach, Buffer*/

require('assert');
require('should');
const request = require('request');
const q       = require('q');
const auth    = require('../index');
const mocks   = require('./mocks.js');
const USER    = process.env.TEST_USERNAME;
const PASS    = process.env.TEST_PASSWORD;
const funcs   = {};

funcs.validateUser = (user) => {
    user.should.have.property('account_number', '540155');
    user.should.have.property('org_id', '1979710');
    user.should.have.property('is_active', true);
    user.should.have.property('is_org_admin', true);
    user.should.have.property('is_internal', true);
    user.should.have.property('sso_username', USER);
    user.should.have.property('email', 'ihands@redhat.com');
    user.should.have.property('locale', 'en_US');
    user.should.have.property('mechanism');
    user.should.have.property('cachehit');
};

// In some places here...
// why not arrow???
// https://github.com/mochajs/mocha/issues/2018
// also before().timeout() does not seem to work, lame it works for it's though

describe('Functional Tests:', () => {
    describe('execChain', () => {
        beforeEach(() => {
            delete mocks.priv.req.authorized;
        });

        describe('systemid', function () {
            it('should return a valid user object when valid creds are passed in', () => {
                const deferred = q.defer();

                mocks.priv.req.headers = {};
                mocks.priv.req.headers[process.env.SYSTEMIDAUTH_HEADER] = process.env.TEST_SYSTEMID;

                auth.execChain(mocks.app, [auth.keycloakJwt,  auth.systemid], deferred);

                return deferred.promise.then((user) => {
                    user.should.have.property('account_number', '540155');
                    user.should.have.property('is_active', true);
                    user.should.have.property('is_org_admin', false);
                    user.should.have.property('is_internal', false);
                    user.should.have.property('sso_username', 'systemid-system-540155');
                    user.should.have.property('mechanism', 'SystemIdAuth');
                    user.should.have.property('cachehit', false);
                });
            }).timeout(15 * 1000);
        });

        describe('cert', function () {
            it('should return a valid user object when valid creds are passed in', () => {
                const deferred = q.defer();

                mocks.priv.req.headers = {};
                mocks.priv.req.headers[process.env.CERTAUTH_HOSTHEADER] = 'cert-api.access.redhat.com';
                mocks.priv.req.headers[process.env.CERTAUTH_COMMONNAMEHEADER] = process.env.TEST_COMMON_NAME;
                mocks.priv.req.headers[process.env.CERTAUTH_ISSUERHEADER] = process.env.CERTAUTH_TRUSTEDISSUER;

                auth.execChain(mocks.app, [auth.keycloakJwt,  auth.cert], deferred);

                return deferred.promise.then((user) => {
                    user.should.have.property('account_number', '540155');
                    user.should.have.property('org_id', '1979710');
                    user.should.have.property('is_active', true);
                    user.should.have.property('is_org_admin', true);
                    user.should.have.property('is_internal', false);
                    user.should.have.property('sso_username', 'cert-system-540155');
                    user.should.have.property('mechanism', 'CertAuth');
                    user.should.have.property('cachehit', false);
                });
            }).timeout(15 * 1000);
        });

        describe('strata-basic', () => {
            it('should fail when invalid creds are passed in', (done) => {
                const deferred = q.defer();

                mocks.priv.req.get = (str) => {
                    if (str === 'authorization') {
                        return 'Basic aW52YWxpZAo=';
                    }
                    throw new Error(`TestError: unimplemented req.get(${str})`);
                };

                auth.execChain(mocks.app, [auth.keycloakJwt,  auth.strataBasic], deferred);

                return deferred.promise.then(() => {
                    done(new Error('got a non 401 when bad credentials were passed in!'));
                }).catch((status) => {
                    status.should.equal(401);
                    done();
                });
            }).timeout(15 * 1000);

            it('should return a valid user object when valid creds are passed in', () => {
                const deferred = q.defer();

                mocks.priv.req.get = (str) => {
                    if (str === 'authorization') {
                        return 'Basic ' + new Buffer(`${USER}:${PASS}`).toString('base64');
                    }
                    throw new Error(`TestError: unimplemented req.get(${str})`);
                };

                auth.execChain(mocks.app, [auth.keycloakJwt,  auth.strataBasic], deferred);

                return deferred.promise.then((user) => {
                    funcs.validateUser(user);
                    user.should.have.property('cachehit', false);
                });
            }).timeout(15 * 1000);
        });

        describe('smw-basic', () => {
            it('should fail when invalid creds are passed in', (done) => {
                const deferred = q.defer();

                mocks.priv.req.get = (str) => {
                    if (str === 'authorization') {
                        return 'Basic aW52YWxpZAo=';
                    }
                    throw new Error(`TestError: unimplemented req.get(${str})`);
                };

                auth.execChain(mocks.app, [auth.smwBasic], deferred);

                return deferred.promise.then(() => {
                    done(new Error('got a non 401 when bad credentials were passed in!'));
                }).catch((status) => {
                    status.should.equal(401);
                    done();
                });
            });

            it('should return a valid user object when valid creds are passed in', () => {
                const deferred = q.defer();

                mocks.priv.req.get = (str) => {
                    if (str === 'authorization') {
                        return 'Basic ' + new Buffer(`${USER}:${PASS}`).toString('base64');
                    }
                    throw new Error(`TestError: unimplemented req.get(${str})`);
                };

                auth.execChain(mocks.app, [auth.smwBasic], deferred);

                return deferred.promise.then((user) => {
                    funcs.validateUser(user);
                    user.should.have.property('cachehit', false);
                });
            }).timeout(5 * 1000);
        });

        describe('keycloakJwt', function() {
            const opts = {
                url: 'https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token',
                form: {
                    grant_type: 'password',
                    client_id:  'customer-portal',
                    username:   USER,
                    password:   PASS
                }
            };

            before((done) => {
                this.timeout(10 * 1000);
                request.post(opts, (err, res, body) => {
                    if (err) { console.err(err); return; }
                    mocks.addCookie('rh_jwt', JSON.parse(body).access_token);
                    done();
                });
            });

            it('should return a valid user object when valid creds are passed in', () => {
                const deferred = q.defer();
                auth.execChain(mocks.app, [auth.keycloakJwt], deferred);
                return deferred.promise.then((user) => {
                    funcs.validateUser(user);
                    user.should.have.property('cachehit', false);
                });
            });

            it('should never cache a JWT hit', () => {
                const deferred = q.defer();

                delete mocks.priv.req.authorized;
                auth.execChain(mocks.app, [auth.keycloakJwt], deferred);

                return deferred.promise.then((user) => {
                    funcs.validateUser(user);
                    user.should.have.property('cachehit', false);
                });
            });
        });
    });
});
