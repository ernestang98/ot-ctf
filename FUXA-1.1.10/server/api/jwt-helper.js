'use strict';

const jwt = require('jsonwebtoken');

const cookieParser = require('cookie-parser')
const crypto = require('crypto');

var secretCode = 'frangoteam751'; //public key
var tokenExpiresIn = 60 * 15;   // 15 minutes
const adminGroups = [-1, 255];

const authenticated_hash = crypto.createHash('md5').update("authenticated").digest('hex');
const user_hash = crypto.createHash('sha1').update("user").digest('hex');
const admin_hash = crypto.createHash('sha1').update("admin").digest('hex');

function init(_secretCode, _tokenExpires) {
    if (_secretCode) {
        secretCode = _secretCode;
    }
    if (_tokenExpires) {
        tokenExpiresIn = _tokenExpires;
    }
}

const vulnerable_validate_cookie = (permission_hash, req, res, next) => {
  return (req, res, next) => {
    const session_id = req.cookies.session_id
    console.log(req.cookies)
    if (!session_id || session_id === undefined) {
      return res.status(403).send('Forbidden');
    }
    if (!session_id.includes(".")) {
        console.log("ERR")
      return res.status(403).send('Invalid Cookie. Your IP has been reported!');
    }
    const session_id_array = session_id.split(".")
    if (session_id_array.length != 2) {
      return res.status(403).send('Invalid Cookie. Your IP has been reported!');
    }
    const auth_hash = session_id_array[1]
    const user_hash = session_id_array[0]
    if (auth_hash !== authenticated_hash || user_hash !== permission_hash) {
      return res.status(403).send('Invalid Cookie. Your IP has been reported!');
    }
    next()
  }
}

function verifyToken (req, res, next) {
    let token = req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, secretCode, (err, decoded) => {
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

                const session_id = req.cookies.session_id
                if (!session_id || session_id === undefined) {
                    res.status(403).json({ error: "unauthorized_error", message: "Forbidden!" });
                }
                else if (!session_id.includes(".")) {
                    res.status(403).json({ error: "unauthorized_error", message: "Invalid Cookie. Your IP has been reported!" });
                }
                else {
                    const session_id_array = session_id.split(".")
                    if (session_id_array.length != 2) {
                        res.status(403).json({ error: "unauthorized_error", message: "Invalid Cookie. Your IP has been reported!" });
                    } else {
                        const auth_hash = session_id_array[1]
                        const user_hash = session_id_array[0]

                        var permission_hash = ""

                        if (req.userGroups == -1) {
                            permission_hash = admin_hash
                        } else {
                            permission_hash = user_hash
                        }

                        if (auth_hash !== authenticated_hash || user_hash !== permission_hash) {
                            res.status(403).json({ error: "unauthorized_error", message: "Invalid Cookie. Your IP has been reported!" });
                        }
                    }
                }
                next()
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
    get secretCode() { return secretCode },
    get tokenExpiresIn() { return tokenExpiresIn },
    adminGroups: adminGroups
};
