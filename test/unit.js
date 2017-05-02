/*global require, process, describe, it, beforeEach*/

require('assert');
require('should');
const td      = require('testdouble');
const samples = require('./samples');
const request = td.replace('request');
const auth    = require('../index');
const funcs   = {};

funcs.validateUser = (user) => {
    user.should.have.property('account_number', samples.pub.accountNumber);
    user.should.have.property('org_id', samples.pub.orgId);
    user.should.have.property('email', samples.pub.email);
    user.should.have.property('locale', 'en_US');
    user.should.have.property('is_org_admin');
    user.should.have.property('is_internal');
    user.should.have.property('sso_username', samples.pub.ssoUsername);
};

describe('Unit Tests:', () => {
    describe('strataBasic', () => {
        let mechanism;

        beforeEach(() => {
            // get a new one each time an it is run
            mechanism = new auth.strataBasic();
        });

        describe('getCacheKey', () => {
            it('should get an hashed cache key', () => {
                mechanism.getCacheKey('foobar').should.equal('ClAmHr0aOQ/tK/Mm8mc8FFWCpjQtUjIElz0CGTN/gWFqgGmwElh89WNfaSXxtWw2AjDBmyc1AO4BPgMGAb8kJQ==');
            });
        });

        describe('doRemoteCall', () => {
            it('should call fail() on a non 200 response', (done) => {
                td.when(request(td.matchers.anything())).thenCallback(false, { statusCode: 500 }, 'test');

                mechanism.fail = (msg) => {
                    msg.should.equal('Got a bad statusCode from StrataBasicAuth: 500');
                    done();
                };

                mechanism.doRemoteCall('fdsafas');
            });

            it('should call fail() on a reques error', (done) => {
                td.when(request(td.matchers.anything())).thenCallback('TEST ERROR', { statusCode: 500 }, 'test');

                mechanism.fail = (msg) => {
                    msg.should.equal('Got a request error StrataBasicAuth: TEST ERROR');
                    done();
                };

                mechanism.doRemoteCall('fdsafas');
            });
        });

        describe('buildUserObject', () => {
            const getInput = (override) => {
                return JSON.stringify(Object.assign(samples.strataUserObject, override));
            };

            it('should look like the standard user object', () => {
                const userObject = mechanism.buildUserObject(getInput());
                funcs.validateUser(userObject);
                userObject.should.have.property('is_active', true);
                userObject.should.have.property('is_org_admin', true);
                userObject.should.have.property('is_internal', true);
            });

            it('should detect the abcense of the internal role', () => {
                const userObject = mechanism.buildUserObject(getInput({
                    rights: {
                        right: [
                            { name: 'AllowEmailContact', has_access: false }
                        ]
                    }
                }));
                funcs.validateUser(userObject);
                userObject.should.have.property('is_active', true);
                userObject.should.have.property('is_org_admin', true);
                userObject.should.have.property('is_internal', false);
            });
        });
    });

    describe('keycloakJwt', () => {
        let mechanism;

        beforeEach(() => {
            // get a new one each time an it is run
            mechanism = new auth.keycloakJwt();
        });

        describe('doRemoteCall', () => {
            it('should fail() (quickly) when a bogus JWT is given', (done) => {
                mechanism.fail = (msg) => {
                    msg.should.equal('No username found in JWT: JsonWebTokenError: jwt malformed');
                    done();
                };
                mechanism.doRemoteCall('fdsfjkslfjsklfjjeiwjr4324', 'bogus');
            }).timeout(10);
        });

        describe('buildUserObject', () => {

            const getInput = (override) => {
                return Object.assign(samples.keycloakJwtUserObject, override);
            };

            it('should look like the standard user object', () => {
                const userObject = mechanism.buildUserObject(getInput());
                funcs.validateUser(userObject);
                userObject.should.have.property('is_org_admin', true);
                userObject.should.have.property('is_internal', true);
            });

            it('should handle Strings or Numbers', () => {
                const userObject = mechanism.buildUserObject(getInput({
                    account_number: 12345,
                    org_id: 54321
                }));
                funcs.validateUser(userObject);
            });

            it('should detect internal and org_admin being missing', () => {
                const userObject = mechanism.buildUserObject(getInput({
                    realm_access: { roles: [ 'foo' ] }
                }));
                funcs.validateUser(userObject);
                userObject.should.have.property('is_org_admin', false);
                userObject.should.have.property('is_internal', false);
            });
        });
    });
});
