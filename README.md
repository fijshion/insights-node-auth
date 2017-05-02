# insights-node-auth

## Usage with Express
```javascript
const auth = require('insights-node-auth');
...
auth.execChain(app, [auth.keycloakJwt, auth.cert, auth.systemid, auth.smwBasic]);
```
