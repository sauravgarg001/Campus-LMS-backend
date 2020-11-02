const mongoose = require('mongoose');

//Model
const Auth = mongoose.model('Auth');

//Libraries
const logger = require('../libs/loggerLib');
const response = require('../libs/responseLib');
const token = require('../libs/tokenLib');
const check = require('../libs/checkLib');


let isAuthorized = (req, res, next) => {

    if (req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')) {

        Auth.findOne({ authToken: req.header('authToken') || req.params.authToken || req.body.authToken || req.query.authToken })
            .then((auth) => {
                if (check.isEmpty(auth)) {
                    logger.error('No Authorization Key Is Present', 'Authorization Middleware', 10);
                    res.status(404);
                    res.send(response.generate(true, 'Session expired', 404, null));
                } else {
                    token.verifyToken(auth.authToken, auth.tokenSecret)
                        .then((decoded) => {
                            logger.info('authToken Verfied', 'Authorization Middleware', 10);
                            req.user = decoded.data;
                            next();
                        })
                        .catch((err) => {
                            logger.error(err.message, 'Authorization Middleware', 10);
                            res.status(500);
                            res.send(response.generate(true, 'Failed to Authorize!', 500, null));
                        })
                }
            })
            .catch((err) => {
                logger.error(err.message, 'Authorization Middleware', 10);
                res.status(500);
                res.send(response.generate(true, 'Failed to Authorize!', 500, null));
            });
    } else {
        logger.error('Authorization Token Missing', 'AuthorizationMiddleware', 5)
        res.status(400);
        res.send(response.generate(true, 'Authorization token missing!', 400, null));
    }
}

module.exports = {
    isAuthorized: isAuthorized
}