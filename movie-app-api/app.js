const Log = require("./src/shared/logger.js");
Log.createLogger();
const Logger = Log.getLogger();
Logger.info("NODE_ENV: " + process.env.NODE_ENV);
Logger.info("Docker: " + process.env.NODE_DOCKER);
Logger.info("NODE_PORT: " + process.env.NODE_PORT);
const morgan = require('./src/shared/morganMiddleware.js');
const addRequestId = require('express-request-id')(); 

const dbConnection = require('./src/shared/sequelize.js');
const sequelize = dbConnection.createClient();
const models = require('./src/models/index.js');

const errorHandlers = require('./routes/errorHandler.js');
const errorHandler = errorHandlers.errorHandler;
const jsonHandler = errorHandlers.jsonHandler;
const finalErrorHandler = errorHandlers.finalErrorHandler;
const badPageHandler = require('./routes/badPageHandler.js').badPageHandler;

const config = require('./Config.json');
var express = require('express');
var path = require('path');

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
const destroySession = require("./src/shared/sessions.js").destroySession;
const checkForPasswordResetCookie = require("./routes/globals").checkForPasswordResetCookie;
const { fileUploadErrorHandler } = require("./src/ErrorHandlers/FileUploadErrorHandler.js");

// restart db each time
//! NEVER SET THIS TO TRUE, will remove triggers from tables
const eraseDatabaseOnSync = false;
sequelize.sync({ force: eraseDatabaseOnSync });

const port = (process.env.NODE_PORT === undefined) ? 9000 : process.env.NODE_PORT;
const server = https.createServer(httpsOptions, app)
    .listen(port, () =>{
        console.log("App listening on port " + port + "!") 
    });


// add the function sendResponse to the res object
app.use(function(req, res, next) {
    res.sendResponse = async function(body) {  
        try 
        {
            res.locals.function = "sendResponse";
            res.locals.file = "app.js";
            // if the session was regenerated due to the user trying to use the session that was issued to reset 
            // their password for something else
            // essentially makes sure a empty session does not get saved when one is regenerated
            if(res.locals.cleanSession === true && req.session !== undefined && req.session.userId === undefined)
            {
                await destroySession(req);
            }
            res.locals.message = body.message;
            res.send(body);
        }
        catch(err)
        {
            return next(err);
        }
    }
    next();
});

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

app.use(cors({
    origin: 'https://localhost:3000',
    credentials: true
}));


// add id to requests
app.use(addRequestId);
// log requests
app.use(morgan.morganRequestMiddleware);
// log responses
app.use(morgan.morganResponseMiddleware);
// see if password reset cookie is in reqeust and going to correct route
app.use(checkForPasswordResetCookie);

// parse incoming data as json
app.use((req, res, next) => {
  jsonHandler(express.json(), req, res, next);
});

app.use(express.urlencoded({ extended: false }));

// all routes to the server will go through this router
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(badPageHandler);

// error handler, should be last
app.use(function(err, req, res, next) {
    errorHandler(err, req, res, next).catch((err) => {finalErrorHandler(err, req, res, next)});
});

module.exports = app;
