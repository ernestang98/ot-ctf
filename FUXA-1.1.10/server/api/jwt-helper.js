'use strict';

const jwt = require('jsonwebtoken');

var secretCode = 'frangoteam751'; //public key
var pub_key = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA3/HHxFJYjapDb4zb2Jo8
oaWOaBRd4zk/l1ZjOpwAumUhKS/heClLk6DdY6ZPPk6CfmHpd1MiodA6doJi/PWZ
3jL54oZtsK4RrF+FLGYmGDGRjiV47wR0n5gGWV5wKfsk+dTxbAAI6/T7SG9RCID9
ScH7PdqBJJopxhBZHIAoRWyWbvbnNCB+iFh8E9k0XyYJ9VUWcsQmGjToTa/GT1qR
AWA5uP9kD5JfFXY6Infj/L/WHVWbLCdtxcK3BS1X06sRauG3rFJx9LZos+TuNMGr
T/Dt/PRCJhTNzSqQSyg0gGf8g56e2nLWMyaDhdC/h6jukRAifH2E762RUMLsV4mD
HVQE0r/ceUSyPanYQ71egdv1eVy8aamZ/4v0IeXVESYwOvEv1hBTcOhHjadUEzDs
KKpKg7/hGSCo+/SVJBHSrAJNm7mnzM37pzsVE5iekU66MGROFAwUrQazrYoCNgXa
NkIA8ElE0rfNoCRitzsrIHCEUw8cE9E2IBIQSgihvnCboe4dDB2dm3W6uknl3QFz
gUWZl8PbMVxzMk/xVa/zZJ9XAt1pBEV2ijZhewPyAxdNv/xJqLVJzziAyiUEa8rM
nw50nFjadQDnQJxTJc4YV9bZxNekmH5ug0hcFiLp5KTSizKyw0FkoETGVG3J3lLA
SmSBmrgGi+Wo1FbnLRQbPGUCAwEAAQ==
-----END PUBLIC KEY-----`; //public key
var tokenExpiresIn = 60 * 15;   // 15 minutes
const adminGroups = [-1, 255];


function init(_secretCode, _tokenExpires) {
    if (_secretCode) {
        secretCode = _secretCode;
    }
    if (_tokenExpires) {
        tokenExpiresIn = _tokenExpires;
    }
}

function verifyToken (req, res, next) {
    let token = req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, pub_key, (err, decoded) => {
            if (err) {
                req.userId = null;
                req.userGroups = null;
                if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
                    req.tokenExpired = true;
                    res.status(403).json({error:"unauthorized_error", message: "Token Expired!"});
                }
                next();
                // return res.status(500).send({
                //     auth: false,
                //     message: 'Fail to Authentication. Error -> ' + err
                // });
            } else {
                req.userId = decoded.id;
                req.userGroups = decoded.groups;
                if (req.headers['x-auth-user']) {
                    let user = JSON.parse(req.headers['x-auth-user']);
                    if (user && user.groups != req.userGroups) {
                        res.status(403).json({ error: "unauthorized_error", message: "User Profile Corrupted!" });
                    }
                }
                next();
            }
        });
    } else {
        // notice that no token was provided...}
        req.userId = null;
        req.userGroups = null;
        next();
    }
}

function getTokenExpiresIn() {
    return tokenExpiresIn;
}

module.exports = {
    init: init,
    verifyToken: verifyToken,
    get secretCode() { return pub_key },
    get tokenExpiresIn() { return tokenExpiresIn },
    adminGroups: adminGroups
};
