/*global require, process, module*/

module.exports.getMocks = () => {
    const priv = {};
    const uses = [];

    priv.req = {
        cookies: { },
        get: (str) => { throw new Error(`TestError: unimplemented req.get("${str}")`); }
    };

    priv.res = {
        end: () => {},
        json: () => {},
        status: () => {
            return priv.res;
        }
    };

    priv.next = () => {
        if (uses.length > 0) {
            uses.shift()(priv.req, priv.res, priv.next);
        }
    };

    priv.app = {
        use: (cb) => {
            uses.push(cb);
        }
    };

    return {
        addCookie: (key, val) => {
            priv.req.cookies[key] = val;
        },
        app:  priv.app,
        req:  priv.req,
        res:  priv.res,
        next: priv.next
    };
};
