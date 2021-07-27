
console.log("NODE_ENV: " + process.env.NODE_ENV);
console.log("NODE_PORT: " + process.env.NODE_PORT);
console.log("NODE_LOG_LEVEL: " + process.env.NODE_LOG_LEVEL);
import Logger from "./src/shared/logger.js";
import morganMiddleware from "./src/shared/morganMiddleware.js";
Logger.error("Error TEST", {function: "abc", file: "abc.js"});
Logger.warn("WARNING TEST");
Logger.info("INFO TEST");
Logger.http("http test", {sessionId: 'id test'});
Logger.http("http test");
Logger.debug("debug test");


const dbConnection = require('./src/shared/sequelize.js');
const sequelize = dbConnection.createClient();
const models = require('./src/models/index.js');

import {badPageHandler} from './routes/badPageHandler.js';
const errorHandler = require('./routes/errorHandler.js').errorHandler;

const config = require('./Config.json');
var express = require('express');
var path = require('path');
//var morgan = require('morgan');
var cors = require('cors');
var indexRouter = require('./routes/index');
var app = express();

// for https
const https = require('https');
const fs = require('fs');
const httpsOptions = {
    key: fs.readFileSync('./privatekey.pem'),
    cert: fs.readFileSync('./publiccert.pem')
}

// create the redis client
let redis = require('./src/shared/redis.js');
let redisClient = redis.createClient();

const session = require('express-session');
// create the redis store
let redisStore = require('./src/shared/redisStore.js').createStore(session, redisClient);

// to run, npm run server

// restart db each time
//! NEVER SET THIS TO TRUE, will remove triggers from tables
const eraseDatabaseOnSync = false;

sequelize.sync({ force: eraseDatabaseOnSync });


const port = (process.env.NODE_PORT === undefined) ? 9000 : process.env.NODE_PORT;
const server = https.createServer(httpsOptions, app)
    .listen(port, () =>{
        console.log("App listening on port " + port + "!")
    });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(morganMiddleware);

// parse incoming data as json
app.use((req, res, next) => {
  jsonHandler(express.json(), req, res, next);
});

function jsonHandler(middleware, req, res, next) {
  middleware(req, res, (err) => {
    if (err) {
      return res.status(400).send({
          message: "Invalid json found in request",
          requester: ""
      });
    }
    next();
  });
}


app.use(cors({
    origin: 'https://localhost:3000',
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
            secure: true,
            maxAge: config.sessions.maxExpiringDuration, // Time is in miliseconds,
            //domain: 'http://localhost:3000/',
            sameSite: 'lax'
        },
        store: redisStore,
        resave: false
    })
);

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
