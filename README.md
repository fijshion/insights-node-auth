# insights-node-auth [![Build Status](https://travis-ci.org/RedHatInsights/insights-node-auth.svg?branch=master)](https://travis-ci.org/RedHatInsights/insights-node-auth)

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
