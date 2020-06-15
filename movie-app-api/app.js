import models, { sequelize } from './src/models';

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var testAPIRouter = require('./routes/testAPI');
var signUpRouter = require('./routes/signup');

var app = express();

/*
// connect to the database
sequelize.sync().then(() => {
  app.listen(9000, () => {
    console.log(`Example app listening on port 9000!`);
  });
});
*/
// restart db each time
const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
    if (eraseDatabaseOnSync) {
        createUsers();
    }

    app.listen(9000, () =>
        console.log(`Example app listening on port 9000!`),
    );
});

const createUsers = async () => {
    await models.User.create(
        {
            username: 'admin',
            email: 'admin@email.com',
            password: 'password',
            firstName: 'admin',
            lastName: 'admin',
            /*
            use this to add a review associated with a user
            reviews: [
                {
                    title: 'the other guys',
                    ...
                },
                {
                    review 2
                }
            ],
            */
        },
        /*
        {
            include: [models.Review],
        },
        */
    );
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/testAPI', testAPIRouter);
app.use('/signup', signUpRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
