import models, { sequelize } from './src/models';
import {badPageHandler} from './routes/badPageHandler.js';
import {errorHandler} from './routes/errorHandler.js';

const config = require('./Config.json');
const errors = require('./ErrorCodes.json');
var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');
var indexRouter = require('./routes/index');
var app = express();
const fetch = require('node-fetch');

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
app.use(cookieParser(config.app.cookieKey));
app.use(express.static(path.join(__dirname, 'public')));

// all routes to the server will go through this router
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    badPageHandler(req, res, next);
});

// error handler
app.use(function(err, req, res, next) {
    errorHandler(err, req, res, next);
});

module.exports = app;
