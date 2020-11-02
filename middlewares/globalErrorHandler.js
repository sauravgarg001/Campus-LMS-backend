const response = require('../libs/responseLib')

let errorHandler = (err, req, res, next) => {
    console.log("application error handler called: " + err);
    res.send(response.generate(true, 'Some error occured at global level', 500, null))
}

let notFoundHandler = (req, res, next) => {
    console.log("Global not found handler called");
    res.status(404).send(response.generate(true, 'Route not found in the application', 404, null))
}

module.exports = {
    globalErrorHandler: errorHandler,
    globalNotFoundHandler: notFoundHandler
}