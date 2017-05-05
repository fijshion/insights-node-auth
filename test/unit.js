/*global require, process, describe, it, beforeEach*/

require('assert');
require('should');
const td      = require('testdouble');
const Mocks   = require('./mocks');
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
    describe('multiple', () => {
        describe('SmwBasicAuth and StrataBasicAuth', () => {
            it('should both give the same cache key', () => {
                const mocks = Mocks.getMocks();
                mocks.req.get = (str) => {
                    if (str === 'authorization') {
                        return 'VGVzdFVzZXI6VGVzdFBhc3M='; // TestUser:TestPass
                    }
                    throw new Error(`TestError: unimplemented req.get("${str}")`);
                };

                const smw    = new auth.smwBasic(mocks.req);
                const strata = new auth.strataBasic(mocks.req);
                const smwOutput = smw.getCacheKey(smw.getCreds());
                const strataOutput = strata.getCacheKey(strata.getCreds());

                smwOutput.should.equal(strataOutput);
            });
        });
    });

    describe('smwBasic', () => {
        let mechanism;

        beforeEach(() => {
            // get a new one each time an it is run
            mechanism = new auth.smwBasic();
        });

        describe('doRemoteCall', () => {
            it('should call fail() on a non 200 response', (done) => {
                td.when(request(td.matchers.anything())).thenCallback(false, { statusCode: 500 }, 'test');

                mechanism.fail = (msg) => {
                    msg.should.equal('Got a bad statusCode from SmwBasicAuth: 500');
                    done();
                };

                mechanism.doRemoteCall('fdsafas');
            });

            it('should call fail() on a reques error', (done) => {
                td.when(request(td.matchers.anything())).thenCallback('TEST ERROR', { statusCode: 500 }, 'test');

                mechanism.fail = (msg) => {
                    msg.should.equal('Got a request error SmwBasicAuth: TEST ERROR');
                    done();
                };

                mechanism.doRemoteCall('fdsafas');
            });
        });

        describe('buildUserObject', () => {
            const getInput = (override) => {
                return Object.assign(samples.smwBasicUserObject, override);
            };

            it('should look like the standard user object', () => {
                const userObject = mechanism.buildUserObject(getInput());
                funcs.validateUser(userObject);
                userObject.should.have.property('is_active', true);
                userObject.should.have.property('is_org_admin', true);
                userObject.should.have.property('is_internal', true);
            });

            it('should detect the absence of the internal and org admin roles', () => {
                const userObject = mechanism.buildUserObject(getInput({
                    roles: []
                }));
                funcs.validateUser(userObject);
                userObject.should.have.property('is_active', true);
                userObject.should.have.property('is_org_admin', false);
                userObject.should.have.property('is_internal', false);
            });
        });
    });

    describe('cert', () => {
        let mechanism;

        beforeEach(() => {
            // get a new one each time an it is run
            mechanism = new auth.cert();
        });

        describe('buildUserObject', () => {
            const getInput = (override) => {
                return Object.assign(samples.certUserObject, override);
            };

            const validateCertUser = (userObject) => {
                userObject.should.have.property('account_number', samples.pub.accountNumber);
                userObject.should.have.property('org_id', samples.pub.orgId);
                userObject.should.have.property('is_org_admin');
                userObject.should.have.property('is_internal');
                userObject.should.have.property('sso_username', `cert-system-${samples.pub.accountNumber}`);
            };

            it('should look like the standard user object', () => {
                const userObject = mechanism.buildUserObject(getInput());
                validateCertUser(userObject);
            });

            it('should handle Strings or Numbers', () => {
                const input = getInput();

                input.oracleCustomerNumber = String(input.oracleCustomerNumber);
                let userObject = mechanism.buildUserObject(input);
                validateCertUser(userObject);


                input.oracleCustomerNumber = Number(input.oracleCustomerNumber);
                userObject = mechanism.buildUserObject(input);
                validateCertUser(userObject);
            });
        });
    });

    describe('strataBasic', () => {
        let mechanism;

        beforeEach(() => {
            // get a new one each time an it is run
            mechanism = new auth.strataBasic();
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

            it('should detect the absence of the internal role', () => {
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
