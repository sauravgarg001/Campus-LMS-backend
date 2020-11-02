var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const helmet = require('helmet');

//Config
const appConfig = require('./config/configApp');

//Models
const SREModel = require('./models/SRE');
const AuthModel = require('./models/Auth');
const ProgrammeModel = require('./models/Programme');
const BatchModel = require('./models/Batch');
const StudentModel = require('./models/Student');
const FacultyModel = require('./models/Faculty');


var app = express();

//Middlewares
const routeLoggerMiddleware = require('./middlewares/routeLogger');
const globalErrorMiddleware = require('./middlewares/globalErrorHandler');

app.use(logger(appConfig.environment));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(routeLoggerMiddleware.logIp);
app.use(globalErrorMiddleware.globalErrorHandler);
app.use(helmet());

//Routes
var indexRouter = require('./routes/index');
var sreRouter = require('./routes/sre');
app.use(`${appConfig.apiVersion}/`, indexRouter);
app.use(`${appConfig.apiVersion}/admin`, sreRouter);

//Mongoose connection
const connect = mongoose.connect(appConfig.db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});
connect.then((db) => {
    console.log("Mongoose connection successfully opened");
}, (err) => { console.log(err); });

module.exports = app;