/*global require, process, module*/

const priv = {
    req: {
        cookies: { },
        get: (str) => { throw new Error(`TestError: unimplemented req.get("${str}")`); }
    },
    res: {
        end: () => {},
        status: () => {}
    }
};

priv.next = () => { };

module.exports.app = {
    use: (cb) => { cb(priv.req, priv.res, priv.next); }
};

module.exports.addCookie = (key, val) => {
    priv.req.cookies[key] = val;
};

module.exports.setNext = (next) => { priv.next = next; };
module.exports.priv = priv;
