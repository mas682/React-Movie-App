import models, { sequelize } from './src/models';
import {badPageHandler} from './routes/badPageHandler.js';
import {errorHandler} from './routes/errorHandler.js';

const config = require('./Config.json');
const errors = require('./ErrorCodes.json');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');
var indexRouter = require('./routes/index');
const moment = require('moment');
var app = express();
const fetch = require('node-fetch');
import {regenerateSession, checkSession} from './src/sessions.js';


const redis = require('redis');
const session = require('express-session');
let RedisStore = require('connect-redis')(session);
let redisClient = redis.createClient();
const sessionHelpers = require('./src/sessions.js');

// to run, npm run server

// restart db each time
//! NEVER SET THIS TO TRUE, will remove triggers from tables
const eraseDatabaseOnSync = false;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
    app.listen(9000, () =>
        console.log(`Example app listening on port 9000!`),
    );
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        //secret: ['veryimportantsecret','notsoimportantsecret','highlyprobablysecret'],
        secret: config.app.cookieKey,
        name: config.app.cookieName,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            httpOnly: true,
            // should be true
            secure: false,
            sameSite: true,
            //maxAge: 600000, // Time is in miliseconds,
            maxAge: 15000, // Time is in miliseconds,
            // to set a expiration date...
            //expires: moment(new Date()).add(10, 'm').toDate()
        },
        store: new RedisStore({ client: redisClient ,ttl: 86400}),
        resave: false
    })
);

app.use(sessionHelpers.checkSession);

// all routes to the server will go through this router
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(
    function(req, res, next) { badPageHandler(req, res, next)}
 );

// error handler
app.use(function(err, req, res, next) {
    errorHandler(err, req, res, next);
});

module.exports = app;
