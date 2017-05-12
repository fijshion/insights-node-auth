# insights-node-auth
[![Build Status](https://travis-ci.org/RedHatInsights/insights-node-auth.svg?branch=master)](https://travis-ci.org/RedHatInsights/insights-node-auth)
[![dependencies Status](https://david-dm.org/RedHatInsights/insights-node-auth/status.svg)](https://david-dm.org/RedHatInsights/insights-node-auth)
[![devDependencies Status](https://david-dm.org/RedHatInsights/insights-node-auth/dev-status.svg)](https://david-dm.org/RedHatInsights/insights-node-auth?type=dev)

## Usage with Express
```javascript
const auth = require('insights-node-auth');
...
auth.execChain(app, [auth.keycloakJwt, auth.cert, auth.systemid, auth.smwBasic]);
```
## Running tests
```
$ npm test
```
