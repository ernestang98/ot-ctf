/**
 * 'api/auth': Authentication API to Sign In/Out users
 */

var express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authJwt = require('../jwt-helper');

var runtime;
var secretCode;
var tokenExpiresIn;
const pvt_key =`-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`

module.exports = {
    init: function (_runtime, _secretCode, _tokenExpires) {
        runtime = _runtime;
        secretCode = _secretCode;
        tokenExpiresIn = _tokenExpires;
    },
    app: function () {
        var authApp = express();
        authApp.use(function (req, res, next) {
            if (!runtime.project) {
                res.status(404).end();
            } else {
                next();
            }
        });

        /**
         * POST SignIn
         * Sign In with User credentials
         */
        authApp.post('/api/signin', function (req, res, next) {
            runtime.users.findOne(req.body).then(function (userInfo) {
                if (userInfo && userInfo.length && userInfo[0].password) {
                    if (bcrypt.compareSync(req.body.password, userInfo[0].password)) {
                        // const token = jwt.sign({ id: userInfo[0].username, groups: userInfo[0].groups }, secretCode, { algorithm: 'HS256', expiresIn: tokenExpiresIn });//'1h' });
                        const token = jwt.sign({ id: userInfo[0].username, groups: userInfo[0].groups }, pvt_key, { algorithm: 'RS256', expiresIn: tokenExpiresIn });//'1h' });
                        res.json({ status: 'success', message: 'user found!!!', data: { username: userInfo[0].username, fullname: userInfo[0].fullname, groups: userInfo[0].groups , token: token } });
                        runtime.logger.info('api-signin: ' + userInfo[0].username + ' ' + userInfo[0].fullname + ' ' + userInfo[0].groups);
                    } else {
                        res.status(401).json({ status: 'error', message: 'Invalid email/password!!!', data: null });
                        runtime.logger.error('api post signin: Invalid email/password!!!');
                    }
                } else {
                    res.status(404).end();
                    runtime.logger.error('api post signin: Not Found!');
                }
            }).catch(function (err) {
                if (err.code) {
                    res.status(400).json({error:err.code, message: err.message});
                } else {
                    res.status(400).json({error:'unexpected_error', message:err.toString()});
                }
                runtime.logger.error('api post signin: ' + err.message);
            });
        });

        return authApp;
    }
}