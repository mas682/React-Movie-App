import models, { sequelize } from './src/models';
import {badPageHandler} from './routes/badPageHandler.js';
import {errorHandler} from './routes/errorHandler.js';

const config = require('./Config.json');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');
var indexRouter = require('./routes/index');
const moment = require('moment');
var app = express();
const fetch = require('node-fetch');

//const sessionHelpers = require('./src/sessions.js');
// create the redis client
let redis = require('./src/redis.js');
let redisClient = redis.createClient();

const session = require('express-session');
// create the redis store
let redisStore = require('./src/redisStore.js').createStore(session, redisClient);


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
        //unset:
        rolling: true,
        cookie: {
            // needs to be set to true to prevent javascript from accessing client side
            httpOnly: true,
            // should be true to help avoid man in the middle attacks
            secure: false,
            maxAge: config.sessions.maxExpiringDuration, // Time is in miliseconds,
            //domain: 'http://localhost:3000/',
            sameSite: 'lax'
        },
        store: redisStore,
        resave: false
    })
);

//app.use(sessionHelpers.checkCookieType);

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
